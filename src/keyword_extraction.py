# Reference: https://www.kaggle.com/code/arplusman/papers-retrieval

import nltk
import ssl
import spacy
import csv
# from nltk.tokenize import word_tokenize as nltk_tokenizer
from spacy.lang import en
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# nltk.download()
# nltk.download('punkt')
# nltk.download('wordnet')
# nltk.download('wordnet2022')


nlp = spacy.blank('en')
wnl = WordNetLemmatizer()
nlp2 = spacy.load('en_core_web_sm')
spacy_stop_words = [word.text for word in nlp2.vocab if word.is_stop]
nltk_stop_words = stopwords.words('english')
stop_words = set(spacy_stop_words).union(nltk_stop_words)

for stop_word in stop_words:
    nlp2.vocab[stop_word].is_stop = True

frequent_words = ['model', 'result', 'system', 'method', 'study', 'group', 'paper', 'problem']
for word in frequent_words:
    nlp2.vocab[word].is_stop = True
# stop_words = set(frequent_words).union(stop_words)

check_token = lambda tok: not (tok.is_stop or tok.is_punct or tok.is_digit or tok.is_quote or tok.is_currency or tok.is_space)
# check_token = lambda tok: not ((tok in stop_words) or (tok in frequent_words) or tok.is_punct or tok.is_digit or tok.is_quote or tok.is_currency or tok.is_space)

# Tokenization (Spacy)
# Lemmatization (Spacy)
# Removing stop words (nltk, spacy)
# Removing frequent words (manual)

def get_keywords_list(csv_file_path):
    keywords = set()

    with open(csv_file_path, newline='') as csvfile:
        csv_reader = csv.reader(csvfile)
        is_colname = True
        for row in csv_reader:
            if is_colname == True:
                is_colname = False
                continue
            else:
                _, _, _, abstract, _, _, _, _, _, _ = row
                docs = list(nlp(abstract.lower()))
                # print("Docs:")
                # print(docs)
                tokens = [wnl.lemmatize(str(token)) for token in docs if check_token(token)]
                keywords = set(tokens).union(keywords)
    
    return list(keywords)

# keywords = get_keywords_list("./data/sample.csv")
# print("Keywords:")
# print(keywords)