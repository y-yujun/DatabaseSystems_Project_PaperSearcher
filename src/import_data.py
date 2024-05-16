import sqlite3
import pathlib
import csv
import random
# from keyword_extraction import get_keywords_list
# from paper_keyword_assignment import assign_paper_keywords


def get_database(dp_path: str) -> sqlite3.Connection:
    path_to_lib = pathlib.Path(dp_path).absolute().as_uri()
    connection = None
    try:
        connection = sqlite3.connect(f"{path_to_lib}?mode=rw", uri=True)
    except sqlite3.OperationalError:
        print("Error: Database not found")
        exit(1)
    return connection

connection = get_database("ResearchPapers.sqlite")
db_cursor = connection.cursor()

# db_cursor.execute("DROP TABLE Author")
# db_cursor.execute("DROP TABLE Keyword")
# db_cursor.execute("DROP TABLE Paper")
# db_cursor.execute("DROP TABLE PaperAuthor")
# db_cursor.execute("DROP TABLE PaperKeyword")
# db_cursor.execute("DROP TABLE Users")
db_cursor.execute("DROP TABLE UserPaper")

# # Create tables
# with open('data/create_tables.sql', 'r') as file:
#     sql_queries = file.read()
# queries = sql_queries.split(';')
# for query in queries:
#     try:
#         if query.strip() != '':
#             db_cursor.execute(query)
#             connection.commit()
#             print("Table created successfully!")
#     except Exception as e:
#         print("Error executing query:", str(e))

sql = """
CREATE TABLE UserPaper (
	userId INTEGER,
	paperId VARCHAR(64),
	notes VARCHAR(8000),
	rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    edit_date VARCHAR(10),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (paperId) REFERENCES Paper(id) ON DELETE CASCADE,
    PRIMARY KEY (userId, paperId)
)
"""
db_cursor.execute(sql)

csv_file_path = 'data/first_1500_data.csv'

# # Populate Paper and Author
# with open(csv_file_path, newline='') as csvfile:
#     csv_reader = csv.reader(csvfile)
#     is_colname = True

#     for row in csv_reader:
#         if is_colname == True:
#             is_colname = False
#             continue
#         else:
#             _, id, title, abstract, author, url, published_date, _, _, _ = row

#             # Paper
#             db_cursor.execute(
#                 "INSERT INTO Paper VALUES (?, ?, ?, ?, ?, DATE('now'))", (id, title, abstract, published_date, url))

            # # Author
            # db_cursor.execute(
            #     "INSERT OR IGNORE INTO Author VALUES (NULL, ?)", (author,))

# # Populate PaperAuthor
# with open(csv_file_path, newline='') as csvfile:
#     csv_reader = csv.reader(csvfile)
#     is_colname = True

#     for row in csv_reader:
#         if is_colname == True:
#             is_colname = False
#             continue
#         else:
#             _, id, title, abstract, author, _, published_date, _, _, _ = row
#         paper_author_sql = f'INSERT INTO PaperAuthor SELECT Paper.id, Author.id FROM Paper, Author WHERE Paper.id="{id}" AND Author.name="{author}"'
#         db_cursor.execute(paper_author_sql)

# # Populate Keyword
# keywords = get_keywords_list(csv_file_path)
# for i, keyword in enumerate(keywords):
#     db_cursor.execute("INSERT INTO Keyword VALUES (?, ?)", (i, keyword))

# # Populate PaperKeyword
# assignments = assign_paper_keywords(csv_file_path, keywords)
# for a in assignments:
#     paperId, keywordId, score = a
#     # print(paperId, keywordId, score)
#     db_cursor.execute(
#         "INSERT INTO PaperKeyword VALUES (?, ?, ?)", (paperId, keywordId, score))

# # Generated user data
# # Populate Users
# users_csv = "data/users.csv"
# with open(users_csv, newline="") as csvfile:
#     csv_reader = csv.reader(csvfile)
#     is_colname = True
#     for row in csv_reader:
#         if is_colname == True:
#             is_colname = False
#         else:
#             username, email, password = row
#             db_cursor.execute("INSERT INTO Users VALUES(NULL, ?, ?, ?)", (username, email, password))

# Populate UserPaper
paperIds = []
with open(csv_file_path, newline="") as csvfile:
    csv_reader = csv.reader(csvfile)
    is_colname = True
    for row in csv_reader:
        if is_colname == True:
            is_colname = False
        else:
            paperIds.append(row[1])
            
for _ in range(2000):
    userId = random.randint(1, 1000)
    paperId = random.choice(paperIds)
    rating = random.randint(1, 5)
    db_cursor.execute("INSERT OR IGNORE INTO UserPaper VALUES (?, ?, ?, ?, ?)", (userId, paperId, 'null', rating, 'null'))

connection.commit()
connection.close()