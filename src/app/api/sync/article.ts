import { db } from "~/server/db"; // Import Prisma client

export async function createStory(title: string, summary: string) {
    const story = await db.story.create({
        data: { title, summary :[summary] },
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
    const outlet = await db.newsOutlet.findFirst({
        where: { name: outletName }, 
        select: { id: true },
    });
    
    if (!outlet) {
        throw new Error(`⚠️ News outlet "${outletName}" does not exist. Please check the name or add it to the database.`);
    }
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
                    email: `${reporterName.toLowerCase().replace(/\s/g, '')}@example.com`,
                    outlet: { connect: { id: outlet.id }}
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
                    email: `${systemReporterName.replace(/\s/g, '')}@example.com`,
                    outlet: { connect: { id: outlet.id }}
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