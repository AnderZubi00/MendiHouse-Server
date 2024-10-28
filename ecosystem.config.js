module.exports = {
    apps: [
      {
        name: "MendiHouse-Server",
        script: "./index.js",
        exec_mode: "cluster_mode",
  
        
        // Logging
        out_file: "./pm2/out.log",
        error_file: "./pm2/error.log",
        merge_logs: true,
        log_date_format: "DD-MM HH:mm:ss Z",
        // log_type: "json",
  
      },
    ],
};
