#!/bin/bash
echo "The Source fetcher watching..."
while true; do
  cd "$(dirname "$0")"
  source venv/bin/activate
  python3 fetcher.py
  echo "Next fetch in 15 minutes..."
  sleep 900
done
