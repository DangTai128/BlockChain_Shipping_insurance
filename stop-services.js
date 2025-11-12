// Script để kill tất cả processes đang chạy trên các port
const { exec } = require('child_process');

const ports = [3000, 3001, 8545];

console.log('🛑 Stopping all services...');

ports.forEach(port => {
  exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
    if (stdout) {
      const lines = stdout.trim().split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            console.log(`Killing process ${pid} on port ${port}`);
            exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
              if (error) {
                console.log(`Failed to kill process ${pid}: ${error.message}`);
              } else {
                console.log(`✅ Process ${pid} killed`);
              }
            });
          }
        }
      });
    }
  });
});

setTimeout(() => {
  console.log('🎉 All services stopped. You can now run npm run dev:all');
}, 2000);
