import csv
import numpy as np

from keyword_extraction import get_keywords_list


def assign_paper_keywords(csv_file_path, keywords):
    assignments = []
    d = {}

    df = {}
    n = 0
    with open(csv_file_path, newline='') as csvfile:
        csv_reader = csv.reader(csvfile)
        is_colname = True

        for row in csv_reader:
            if is_colname == True:
                is_colname = False
                continue
            else:
                _, id, _, abstract, _, _, _, _, _, _ = row

            n += 1
            for k in keywords:
                if abstract.count(k) > 0:
                    df[k] = df.get(k, 0) + 1

    with open(csv_file_path, newline='') as csvfile:
        csv_reader = csv.reader(csvfile)
        is_colname = True

        for row in csv_reader:
            if is_colname == True:
                is_colname = False
                continue
            else:
                _, id, _, abstract, _, _, _, _, _, _ = row

            for k in keywords:
                tf_pk = abstract.count(k)
                if k in df:
                    score = tf_pk * np.log(n / df[k])
                    d.setdefault(id, []).append((keywords.index(k), score))

    for key, val in d.items():
        scores = sorted(val, key=lambda x: x[1], reverse=True)
        for (keyword, score) in scores[:10]:
            assignments.append((key, keyword, score))

    return assignments

# file = "./data/sample.csv"
# print(assign_paper_keywords(file, get_keywords_list(file)))