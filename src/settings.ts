class Settings{
    INFURA_PID:         string
    MARIADB_HOST:       string
    MARIADB_PORT:       number
    MARIADB_USER:       string
    MARIADB_PASSWORD:   string
    MARIADB_DATABASE:   string

    constructor() {
        this.INFURA_PID =       process.env.INFURA_PID || "";
        this.MARIADB_HOST =     process.env.MARIADB_HOST || "";
        this.MARIADB_PORT =     parseInt(process.env.MARIADB_PORT) || 0;
        this.MARIADB_USER =     process.env.MARIADB_USER || "";
        this.MARIADB_PASSWORD = process.env.MARIADB_PASSWORD || "";
        this.MARIADB_DATABASE = process.env.MARIADB_DATABASE || "";

        if(!this.INFURA_PID) {
            console.error("[error] Infura project ID not set");
            console.error("[error] * do: 'export INFURA_PID=${Infura_project_ID_here}'");
            process.exit(1);
        }

        if(!this.MARIADB_HOST
            || !this.MARIADB_PORT
            || !this.MARIADB_USER
            || !this.MARIADB_PASSWORD
            || !this.MARIADB_DATABASE) {
            console.error("[error] Cannot load database connection info");
            process.exit(1);
        }
    }
}

export default new Settings();
