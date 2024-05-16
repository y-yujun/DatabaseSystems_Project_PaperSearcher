/*
1.
query finds papers written by an author that have a specific publish date
*/
DECLARE ?authorQuery AS VARCHAR (255) = "foo";
DECLARE ?publishedDate AS DATE = '2010-01-01';

SELECT DISTINCT p.id, p.title
FROM (((PaperAuthor pa JOIN Paper p ON pa.paperId = p.id)
        JOIN Author a ON pa.authorId = a.id) )
WHERE a.name = ?authorQuery
AND p.published_date = ?publishedDate;

/*
2.
query finds authors who have written papers with average relevance to a keyword higher than some amount
*/

DECLARE ?keywordQuery AS VARCHAR (255) = "foo";
DECLARE ?relevanceQuery AS DECIMAL = 20.0;

SELECT a.id, a.name, AVG(pk.score) score
FROM ((((PaperAuthor pa JOIN Paper p ON pa.paperId = p.id)
        JOIN Author a ON pa.authorId = a.id)
        JOIN PaperKeyword pk ON pk.paperId = p.id)
        JOIN Keyword k ON pk.keywordId = k.id)
WHERE k = ?keywordQuery
GROUP BY a.id
HAVING score > relevanceQuery;

/*
3.
query finds authors and papers with average keyword relevance greater than 5 written before 2010 or 
papers written after 2010 with keyword relevance less greater than 3
*/

SELECT DISTINCT a.id, a.name, p.id, p.title
FROM (((PaperAuthor pa JOIN Paper p ON pa.paperId = p.id)
        JOIN Author a ON pa.authorId = a.id)
        JOIN PaperKeyword pk ON pk.paperId = p.id
        JOIN Keyword k ON pk.keywordId = k.id)
WHERE p.published_date < '2010-01-01' AND pk.score > 5
UNION
SELECT DISTINCT a.id, a.name, p.id, p.title
FROM (((PaperAuthor pa JOIN Paper p ON pa.paperId = p.id)
        JOIN Author a ON pa.authorId = a.id)
        JOIN PaperKeyword pk ON pk.paperId = p.id
        JOIN Keyword k ON pk.keywordId = k.id)
WHERE p.published_date > '2010-01-01' AND pk.score < 3;

/*
4. 
query finds papers with title similar to the input or with keyword relevance to the paper of at least 4
*/

DECLARE ?titleQuery AS VARCHAR (255) = "foo";
SELECT p.id, p.title 
FROM ((Paper p JOIN PaperKeyword pk ON p.id = pk.paperId) 
        JOIN Keyword k ON k.id = pk.keywordId)
WHERE p.title LIKE ("%" + titleQuery + "%") OR 
pk.score >= 3;
            


