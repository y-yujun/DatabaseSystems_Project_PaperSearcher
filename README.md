# Paper Searcher

## Project Summary
We plan to build a web application to serve as a research paper database similar to Google Scholar and JSTOR (but limited to CS related papers in this project). It allows users to search for papers and save papers to read later. Each paper will have attributes such as an ID, title, abstract, and published year. Each author will have attributes such as an ID, name, papers, and affiliations. The project aims to improve the search experience for research papers and facilitate academic research by incorporating new features such as advanced searching and note taking.

## Data
https://drive.google.com/drive/folders/1xWG0_fOK9uDLkRBA6p3hn0B81HJWsObz?usp=drive_link
(The database is managed on GCP Platform.)

## Advanced Database Programs
* Trigger: After a paper is added by a user to their dashboard and this action is inserted into the UserPaper table, we get to update the Paper table with the most recent date the selected paper is added by a user.
```sql
  CREATE TRIGGER UpdateRecentAddDate
  AFTER INSERT ON UserPaper
  FOR EACH ROW
  BEGIN
      UPDATE Paper
      SET recent_add_date = CURDATE()
      WHERE id = new.paperId;
  END;
```
* Stored Procedure & Transaction: To filter papers based on quality by user ratings. The stored procedure enables us to loop through the entries of the Paper table to update the average rating of papers and categorize the papers based on their ratings. A transaction is implemented within the procedure to maintain concurrency control during the update.
```sql
CREATE PROCEDURE CalculateAverageRating()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE varPaperId VARCHAR(64);
    DECLARE varAvgRating INT;
    DECLARE varStatus VARCHAR(50);
    DECLARE cur CURSOR FOR (SELECT paperId, AVG(Rating) as AvgRating
                            FROM UserPaper
                            GROUP BY paperId);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    DECLARE exit handler FOR SQLEXCEPTION, SQLWARNING
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    DROP TABLE IF EXISTS Ratings;
    CREATE TABLE Ratings(
        paperId VARCHAR(64) PRIMARY KEY,
    avgRating DECIMAL,
        ratingStatus VARCHAR(50),
    FOREIGN KEY (paperId) REFERENCES Paper(id) ON DELETE CASCADE
    );
    OPEN cur;
    REPEAT
        FETCH cur INTO varPaperId, varAvgRating;  
        IF varAvgRating > 4.0 THEN
            SET varStatus = 1;
        ELSEIF varAvgRating > 3.0 THEN
            SET varStatus = 2;
        ELSE
            SET varStatus = 3;
        END IF;  
        INSERT IGNORE INTO Ratings VALUES (varPaperId, varAvgRating, varStatus); 
    UNTIL done
    END REPEAT;  
    CLOSE cur;
    COMMIT;
END
```

## Creative Components
* NLP Component: We experimented with the Natural Language Toolkit (NLTK) to perform preprocessing tasks such as tokenization and lemmatization on the paper abstracts. Following this, we implemented the Term Frequency-Inverse Document Frequency (TF-IDF) algorithm, a popular method in information retrieval. This algorithm quantifies the significance of terms within a document in relation to the entire corpus, enabling us to rank and retrieve the most relevant documents for a given query effectively.

## Challenges
* SQL Query Optimization: We tried to do indexing to speed up the query processing time, especially when joining large tables during keyword searches. The query should be optimized appropriately without losing its prior accuracy while improving the speed of querying and saving compute resources. However, after carrying out the indexing analysis, the cost needed to run advanced SQL queries remains the same. One possible reason for this is that the tables involved in the query are not large enough for an obvious improvement.

## Future Work
* Improve the speed of database retrieval (through experimenting with indexing, creating more stored procedures, avoiding unnecessary data retrievals in queries, etc.)
* Add more filtering options so that the search results are sorted based on attributes (e.g. user ratings, published date) desired by the user
* Expand the database by including more papers from different fields apart from computer science and technology
* Implement a recommendation system
* Enable ‘Add friends’ and ‘Create/Join Group’ features to share papers among a group 
* Enhancing security (adding authentication methods/detecting suspicious behavior, incorporating input validation techniques to protect against SQL injections, etc.)

## References
* Papers Retrieval: https://www.kaggle.com/code/arplusman/papers-retrieval
* Database: https://www.kaggle.com/datasets/arplusman/papers-by-subject
