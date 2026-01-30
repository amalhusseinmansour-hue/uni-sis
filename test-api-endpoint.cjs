const { Client } = require("ssh2");
const conn = new Client();
const config = {
  host: "69.72.248.125",
  port: 22,
  username: "sisvertexunivers",
  password: "Vertexuni23@@"
};

conn.on("ready", () => {
  console.log("Connected");
  // Test API via public URL
  const cmd = `curl -s -H "Accept: application/json" "https://sis.vertexuniversity.edu.eu/api/students?per_page=1" 2>/dev/null | head -c 3000`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    let out = "";
    stream.on("close", () => { console.log(out); conn.end(); });
    stream.on("data", (data) => { out += data.toString(); });
    stream.stderr.on("data", (data) => { console.error(data.toString()); });
  });
});

conn.on("error", (err) => { console.error("Error:", err.message); });
conn.connect(config);
