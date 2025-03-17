import { api } from "~/trpc/server"; // Import the tRPC API

export async function createStory(title: string, summary: string) {
    const story = await api.story.create.mutate({
        title,
        summary: [summary], 
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
    // Create news outlet using tRPC API
    const outlet = await api.newsOutlet.create.mutate({
        name: outletName,
    });

    if (!outlet) {
        throw new Error(`⚠️ News outlet "${outletName}" does not exist. Please check the name or add it to the database.`);
    }

    let reporterId = null;

    if (reporterName) {
        // Use tRPC API to find or create a reporter
        const existingReporter = await api.reporter.createOrGet.mutate({
            name: reporterName,
            outletId: outlet.id,
        });

        reporterId = existingReporter.id;
    } else {
        const systemReporterName = `system-${outletName}`;

        // Use tRPC API to create a system reporter if one doesn't exist
        const systemReporter = await api.reporter.create.mutate({
            name: systemReporterName,
            isSystem: true,
            email: `${systemReporterName.replace(/\s/g, '')}@example.com`,
            outletId: outlet.id,
        });

        reporterId = systemReporter.id;
    }

    const article = await api.article.create.mutate({
        title,
        content,
        reporterId,
        storyId,
        externalUrl: "",
    });

    return article;
}
