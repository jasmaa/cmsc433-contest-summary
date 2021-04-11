import json
import csv


def convert_to_csv(fname, outfile='out.csv'):
    """Converts downloaded board to csv
    """
    with open(fname, 'r') as f:
        json_data = json.load(f)
    with open(outfile, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'rank', 'maze1', 'maze2',
                         'maze3', 'maze4', 'maze5', 'maze6', 'maze7', 'score'])
        for entry in json_data:
            writer.writerow([entry['name'], entry['rank'],
                             *entry['runs'], entry['score']])


USAGE = 'USAGE: python convert_to_csv.py <json_file>'

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 2:
        print(USAGE)
        exit(1)

    convert_to_csv(sys.argv[1])
    print(f'Converted {sys.argv[1]} to csv')
