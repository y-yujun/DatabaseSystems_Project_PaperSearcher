CREATE TABLE Paper (
    id VARCHAR(64) PRIMARY KEY, 
    title VARCHAR(4096),
    abstract VARCHAR(8000), 
    published_date VARCHAR(10),
    url VARCHAR(8000),
    recent_add_date VARCHAR(10)
);

CREATE TABLE Keyword (
    id INTEGER PRIMARY KEY, 
    keyword VARCHAR(255) UNIQUE
);

CREATE TABLE PaperKeyword ( 
    paperId VARCHAR(64), 
    keywordId INTEGER,
    score Decimal,
    FOREIGN KEY (paperId) REFERENCES Paper(id) ON DELETE CASCADE,
    FOREIGN KEY (keywordId) REFERENCES Keyword(id) ON DELETE CASCADE,
    PRIMARY KEY (paperId, keywordId)
);

CREATE TABLE Users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255),
	email VARCHAR(255),
	password VARCHAR(255)
);

CREATE TABLE UserPaper (
	userId INTEGER,
	paperId VARCHAR(64),
	notes VARCHAR(8000),
	rating INTEGER CHECK (rating BETWEEN 1 AND 5),
	edit_note VARCHAR(10),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (paperId) REFERENCES Paper(id) ON DELETE CASCADE,
    PRIMARY KEY (userId, paperId)
);

CREATE TABLE Author (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE PaperAuthor (
	paperId VARCHAR(64),
	authorId INTEGER,
    FOREIGN KEY (paperId) REFERENCES Paper(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES Author(id) ON DELETE CASCADE,
    PRIMARY KEY (paperId, authorId)
);
