export default class Env {
    private static env = {
        did: {
            infuraPid:      "INFURA_PID",
        },

        broccoli: {
            host:           "BROCCOLI_HOST",
            port:           "BROCCOLI_PORT",
        },

        mongodb: {
            host:           "MONGODB_HOST",
            port:           "MONGODB_PORT",
            rootUser:       "MONGODB_ROOT_USER",
            rootPassword:   "MONGODB_ROOT_PASSWORD",
            user:           "MONGODB_USER",
            password:       "MONGODB_PASSWORD",
            database:       "MONGODB_DATABASE",
        },
    };

    public static get(path: string): string {
        const parsed    = path.split('.');
        const envName   = Env.env[parsed[0]][parsed[1]];
        const value     = process.env[envName];

        if(!value) {
            console.error(`[Error] ${path} is not set`);
            console.error(`[Error] - do 'export ${envName}=$VALUE'`);
            process.exit(1);
        }
        return value as string;
    }
}
