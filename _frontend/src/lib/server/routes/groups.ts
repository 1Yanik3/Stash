import prisma from "../prisma"

export const renameGroup = async (d: {
    groupId: number
    newGroupName: string
}) => {
    const group = await prisma.groupedIntoNames.findUniqueOrThrow({
        where: {
            id: d.groupId
        }
    })

    await prisma.groupedIntoNames.update({
        where: {
            id: group.id
        },
        data: {
            name: d.newGroupName
        }
    })
}
