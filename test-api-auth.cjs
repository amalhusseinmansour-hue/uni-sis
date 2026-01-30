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
  // All in one command - get token and test
  const cmd = `cd /home/sisvertexunivers/laravel-backend && TOKEN=$(php artisan tinker --execute="echo App\\Models\\User::where(role, ADMIN)->first()->createToken(api-test)->plainTextToken;" 2>/dev/null | tail -1) && echo "Token obtained: $TOKEN" && curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" "https://sis.vertexuniversity.edu.eu/api/students/13" 2>/dev/null`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    let out = "";
    stream.on("close", () => { 
      const lines = out.split("\n");
      console.log(lines[0]); // Token line
      const jsonStart = out.indexOf("{");
      if (jsonStart > -1) {
        try {
          const data = JSON.parse(out.substring(jsonStart));
          console.log("Student:", data.name_en);
          console.log("Program ID:", data.program_id);
          console.log("Program:", data.program?.name_en || "NULL");
          console.log("College:", data.program?.college?.name_en || "NULL");
          console.log("Department:", data.program?.department?.name_en || "NULL");
        } catch (e) {
          console.log("Parse error:", e.message);
          console.log("Raw:", out.substring(0, 1000));
        }
      } else {
        console.log("No JSON found:", out);
      }
      conn.end(); 
    });
    stream.on("data", (data) => { out += data.toString(); });
    stream.stderr.on("data", (data) => { console.error(data.toString()); });
  });
});

conn.on("error", (err) => { console.error("Error:", err.message); });
conn.connect(config);
