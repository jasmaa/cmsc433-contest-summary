import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

base_url = 'https://api.cloudflare.com/client/v4'


def backup():
    """Download boards
    """
    res = requests.get(
        f'{base_url}/accounts/{os.getenv("ACCOUNT_ID")}/storage/kv/namespaces/{os.getenv("BOARDS_ID")}/keys',
        headers={'Authorization': f'Bearer {os.getenv("API_TOKEN")}'},
    )

    board_dates = [entry['name'] for entry in res.json()['result']]
    fname = 'dates.json'
    with open(fname, 'w') as f:
        json.dump(board_dates, f)
        print(f'Saved {fname}')

    for d in board_dates:
        res = requests.get(
            f'{base_url}/accounts/{os.getenv("ACCOUNT_ID")}/storage/kv/namespaces/{os.getenv("BOARDS_ID")}/values/{d}',
            headers={'Authorization': f'Bearer {os.getenv("API_TOKEN")}'},
        )
        fname = f'{d}.json'
        with open(fname, 'w') as f:
            json.dump(res.json(), f)
            print(f'Saved {fname}')


if __name__ == '__main__':
    backup()
