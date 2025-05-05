#!/bin/bash

# Function to start an anvil fork
start_anvil_fork() {
    local network=$1
    local rpc_url=$2
    local port=$3

    echo "Starting $network fork on port $port..."
    # Run anvil in the background with specified parameters
    anvil --fork-url $rpc_url --port $port > ./logs/anvil-$network.log 2>&1 &
    
    # Store the PID
    echo $! > ./pids/anvil-$network.pid
    echo "$network fork started with PID $(cat ./pids/anvil-$network.pid)"
}

# Create directories for logs and PIDs if they don't exist
mkdir -p logs pids

# Start each fork with different ports
start_anvil_fork "MAINNET" "https://patient-clean-bird.quiknode.pro/817ffec3a85a03522cdb8f816208fd034e9db3f4" 8545
sleep 10
start_anvil_fork "ARBITRUM" "https://patient-clean-bird.arbitrum-mainnet.quiknode.pro/817ffec3a85a03522cdb8f816208fd034e9db3f4" 8546
sleep 10
start_anvil_fork "OPTIMISM" "https://patient-clean-bird.optimism-mainnet.quiknode.pro/817ffec3a85a03522cdb8f816208fd034e9db3f4" 8547
sleep 10
start_anvil_fork "BASE" "https://base-mainnet.infura.io/v3/4cb67d93b67f48dc8afa0937a5ba0325" 8548
sleep 10
start_anvil_fork "AVALANCHE" "https://patient-clean-bird.avalanche-mainnet.quiknode.pro/817ffec3a85a03522cdb8f816208fd034e9db3f4/ext/bc/C/rpc" 8549
sleep 10
start_anvil_fork "POLYGON" "https://patient-clean-bird.matic.quiknode.pro/817ffec3a85a03522cdb8f816208fd034e9db3f4" 8550

echo "All forks have been started. Check ./logs directory for output."

# Create a stop script
cat > stop-forks.sh << 'EOL'
#!/bin/bash
for pid_file in ./pids/anvil-*.pid; do
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        echo "Stopping fork with PID $pid..."
        kill $pid
        rm "$pid_file"
    fi
done
echo "All forks stopped."
EOL

chmod +x stop-forks.sh

echo "Created stop-forks.sh script to terminate all forks when needed."