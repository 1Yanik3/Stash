import prisma from "./prisma";
import { readdirSync } from "fs";
import { join, extname } from "path";
import ffmpeg from "fluent-ffmpeg";

import { Job } from "@prisma/client";

const registeredJobs = await importAllTsFiles();

// TODO: Total rework of this pls
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/worker/img-to-mp4/")) {
      const inputImagePath = url.pathname.replace("/worker/img-to-mp4/", "");
      const outputPath = "./tmp/" +  inputImagePath + ".mp4";
      console.log(`Converting image to video: ${inputImagePath} -> ${outputPath}`);
      const res: Response = await new Promise((resolve, reject) => {
        ffmpeg(`./media/${inputImagePath}`)
          .loop(1) // Loop the input image
          .videoCodec("libx264") // Set video codec to H.264
          .videoFilters("scale='if(gte(iw/ih,16/9),1920,-1)':'if(gte(iw/ih,16/9),-1,1080)', fps=1") // Resize to even dimensions
          .duration(1) // Set duration to 1 seconds
          .outputOptions("-pix_fmt yuv420p") // Set pixel format
          .save(outputPath) // Save the output file
          .on("end", async () => {
            console.log("Video conversion completed successfully!");
            resolve(new Response(Bun.file(outputPath)));
          })
          .on("error", (err) => {
            console.error("Error occurred during conversion: " + err.message);
            reject(new Response(null, { status: 500 }));
          });
      });
      return res;
    }
    return new Response(null, { status: 404 });
  },
});

while (true) {
  const openJobs = await prisma.job.findMany({
    where: {
      status: "created",
    },
  });

  for (const job of openJobs) {
    for (const registeredJob of registeredJobs) {
      if (job.name === registeredJob.name) {
        console.log(`Running job: ${job.name}`);
        await prisma.job.update({
          where: {
            id: job.id,
          },
          data: {
            status: "running",
          },
        });
        try {
          await registeredJob
            .execute(job)
            .then(async () => {
              await prisma.job.update({
                where: {
                  id: job.id,
                },
                data: {
                  status: "completed",
                },
              });
            })
            .catch(async (error) => {
              await prisma.job.update({
                where: {
                  id: job.id,
                },
                data: {
                  status: "failed",
                  debugMessages: {
                    push: [error.message],
                  },
                },
              });
            });
        } catch (error: any) {
          await prisma.job.update({
            where: {
              id: job.id,
            },
            data: {
              status: "failed",
              debugMessages: {
                push: [error.message],
              },
            },
          });
        }
      }
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function importAllTsFiles() {
  const directory = "./jobs/media";

  // Get all files in the directory
  const files = readdirSync(directory);

  // Initialize an array to hold the exports
  const exportsArray: {
    name: string;
    execute: (job: Job) => Promise<void>;
  }[] = [];

  // Loop through the files
  for (const file of files) {
    // Only process .ts files
    if (extname(file) === ".ts") {
      // Dynamically import the module
      const { execute } = await import(`./${join(directory, file)}`);

      // Add the exports to the array
      exportsArray.push({
        name: file.substring(0, file.length - 3),
        execute,
      });
    }
  }

  return exportsArray;
}
