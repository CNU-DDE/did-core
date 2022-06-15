export function validate(env: { name: string, value: string|undefined }): string {
    if(!env.value) {
        console.error(`[Error] ${env.name} is not set`);
        console.error(`[Error] - do 'export ${env.name}=$VALUE'`);
        process.exit(1);
    }
    return env.value as string;
}
