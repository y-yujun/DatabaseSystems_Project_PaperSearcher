from keyword_extraction import get_keywords_list
from paper_keyword_assignment import assign_paper_keywords

file = "data/sample.csv"
keywords = get_keywords_list(file)
assignments = assign_paper_keywords(file, keywords)
for a in assignments:
    print(a)