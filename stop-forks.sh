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
