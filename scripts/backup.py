import os
import re
import json
import requests
from dotenv import load_dotenv

load_dotenv()

base_url = 'https://api.cloudflare.com/client/v4'

def download_and_save(d, fname):
    """Download and save board given key
    """
    res = requests.get(
        f'{base_url}/accounts/{os.getenv("ACCOUNT_ID")}/storage/kv/namespaces/{os.getenv("BOARDS_ID")}/values/{d}',
        headers={'Authorization': f'Bearer {os.getenv("API_TOKEN")}'},
    )
    with open(fname, 'w') as f:
        json.dump(res.json(), f)
        print(f'Saved {fname}')


def backup():
    """Download boards
    """
    res = requests.get(
        f'{base_url}/accounts/{os.getenv("ACCOUNT_ID")}/storage/kv/namespaces/{os.getenv("BOARDS_ID")}/keys',
        headers={'Authorization': f'Bearer {os.getenv("API_TOKEN")}'},
    )

    board_dates = [entry['name'] for entry in res.json()['result']]
    board_dates = [d for d in board_dates if re.search(r'^\d{4}-\d{2}-\d{2}$', d)]
    fname = 'dates.json'
    with open(fname, 'w') as f:
        json.dump(board_dates, f)
        print(f'Saved {fname}')

    # Save all new dated boards
    for d in board_dates:
        fname = f'./data/{d}.json'
        if not os.path.isfile(fname):
            download_and_save(d, fname)


if __name__ == '__main__':
    backup()
