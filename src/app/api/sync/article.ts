import { db } from "~/server/db";  // Assuming Prisma is used for DB interactions

export async function createStory(title: string, summary: string) {
    const story = await db.story.create({
        data: { title, summary: [summary] },
    });
    return story;
}

export async function createArticle({
    title,
    content,
    reporterName,
    outletName,
    storyId,
}: {
    title: string;
    content: string;
    reporterName?: string;
    outletName: string;
    storyId: string;
}) {
    let reporterId = null;

    if (reporterName) {
        const existingReporter = await db.reporter.findFirst({
            where: { name: reporterName },
        });

        if (existingReporter) {
            reporterId = existingReporter.id;
        } else {
            const newReporter = await db.reporter.create({
                data: { 
                    name: reporterName, 
                    isSystem: false, 
                    outlet: { connect: { name: outletName }
                },
            });            
            reporterId = newReporter.id;
        }
    } else {
        const systemReporterName = `system-${outletName}`;
        let systemReporter = await db.reporter.findFirst({
            where: { name: systemReporterName },
        });

        if (!systemReporter) {
            systemReporter = await db.reporter.create({
                data: { 
                    name: systemReporterName, 
                    isSystem: true, 
                    outlet: { connect: { name: outletName }}
                },
            });           
        }

        reporterId = systemReporter.id;
    }

    return await db.article.create({
        data: {
            title,
            content,
            reporterId,
            storyId,
            externalUrl: "",
        },
    });
}
