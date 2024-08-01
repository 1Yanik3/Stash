import prisma from "./prisma";

console.log(
    await prisma.media.updateMany({
        where: {
            tags: {
                isEmpty: true
            }
        },
        data: {
            tags: {
                push: ["show_unsorted"]
            }
        }
    })
)