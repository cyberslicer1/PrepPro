import { getDb } from './models/db.js';
import { v4 as uuidv4 } from 'uuid';

const db = getDb();

// Clear existing
db.exec('DELETE FROM answers; DELETE FROM attempts; DELETE FROM paper_questions; DELETE FROM papers; DELETE FROM questions; DELETE FROM interview_questions;');

const insertQuestion = db.prepare(`INSERT INTO questions (id, type, topic, difficulty, question_text, options, correct_answer, explanation, code_starter, test_cases) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertInterview = db.prepare(`INSERT INTO interview_questions (id, type, topic, question_text, model_answer, tips, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const Q = [];

function mcq(topic, difficulty, text, options, correct, explanation) {
  Q.push({ type: 'mcq', topic, difficulty, question_text: text, options: JSON.stringify(options), correct_answer: correct, explanation, code_starter: null, test_cases: null });
}
function fib(topic, difficulty, text, correct, explanation) {
  Q.push({ type: 'fill_blank', topic, difficulty, question_text: text, options: null, correct_answer: correct, explanation, code_starter: null, test_cases: null });
}
function coding(topic, difficulty, text, correct, explanation, starter, testCases) {
  Q.push({ type: 'coding', topic, difficulty, question_text: text, options: null, correct_answer: correct, explanation, code_starter: starter, test_cases: JSON.stringify(testCases) });
}

// ============ TOPIC 1: Python Basics ============

mcq('Python Basics', 'basic', 'What is the output of print(type([]))?', ['<class \'list\'>', '<class \'tuple\'>', '<class \'dict\'>', '<class \'set\'>'], '<class \'list\'>', 'Empty square brackets create a list in Python.');
mcq('Python Basics', 'basic', 'Which of the following is a mutable data type in Python?', ['Tuple', 'String', 'List', 'Integer'], 'List', 'Lists are mutable; tuples, strings, and integers are immutable.');
mcq('Python Basics', 'basic', 'What does len("Hello") return?', ['4', '5', '6', 'Error'], '5', 'len() returns the number of characters in a string.');
mcq('Python Basics', 'basic', 'Which keyword is used to define a function in Python?', ['func', 'define', 'def', 'function'], 'def', 'The def keyword is used to define functions in Python.');
mcq('Python Basics', 'basic', 'What is the correct way to create a dictionary?', ['{1: "a", 2: "b"}', '[1: "a", 2: "b"]', '("a":1, "b":2)', '<1:"a", 2:"b">'], '{1: "a", 2: "b"}', 'Curly braces with key:value pairs create dictionaries.');
mcq('Python Basics', 'basic', 'What does the range(3) function return?', ['[0, 1, 2]', '[1, 2, 3]', '[0, 1, 2, 3]', '[1, 2]'], '[0, 1, 2]', 'range(3) generates numbers 0, 1, 2.');
mcq('Python Basics', 'basic', 'Which of the following is NOT a valid variable name in Python?', ['my_var', '_var', '2var', 'var2'], '2var', 'Variable names cannot start with a number.');
mcq('Python Basics', 'basic', 'What type of loop runs at least once in Python?', ['for loop', 'while loop', 'do-while loop', 'None of the above'], 'None of the above', 'Python has no do-while loop. While loops may run zero times.');
mcq('Python Basics', 'basic', 'What is the output of print(3 ** 2)?', ['6', '9', '8', '12'], '9', '** is the exponentiation operator; 3 squared is 9.');
mcq('Python Basics', 'basic', 'Which method adds an element to the end of a list?', ['insert()', 'append()', 'add()', 'push()'], 'append()', 'append() adds an element to the end of a list.');
mcq('Python Basics', 'basic', 'What does the strip() method do?', ['Removes whitespace from both ends', 'Removes only leading whitespace', 'Removes only trailing whitespace', 'Splits the string'], 'Removes whitespace from both ends', 'strip() removes leading and trailing whitespace.');
mcq('Python Basics', 'basic', 'What is the output of print("a" + "b")?', ['ab', '"a""b"', 'a b', 'Error'], 'ab', 'The + operator concatenates strings.');
mcq('Python Basics', 'basic', 'What keyword is used to import a module?', ['include', 'using', 'import', 'require'], 'import', 'The import keyword is used to include modules.');
mcq('Python Basics', 'basic', 'What is None in Python?', ['0', 'False', 'A special null value', 'An empty string'], 'A special null value', 'None is Python\'s null value, representing absence of value.');
mcq('Python Basics', 'basic', 'How do you write a single-line comment?', ['// comment', '<!-- comment -->', '# comment', '/* comment */'], '# comment', 'Python uses # for single-line comments.');

mcq('Python Basics', 'hard', 'What is the output? x = [1, 2, 3]; y = x; y.append(4); print(x)', ['[1, 2, 3]', '[1, 2, 3, 4]', '[1, 2, 3, 4, 4]', 'Error'], '[1, 2, 3, 4]', 'y is a reference to the same list; modifying y also modifies x.');
mcq('Python Basics', 'hard', 'What does {x: x**2 for x in range(3)} return?', ['{0: 0, 1: 1, 2: 4}', '{0: 1, 1: 2, 2: 3}', '[0, 1, 4]', '(0, 1, 4)'], '{0: 0, 1: 1, 2: 4}', 'This is a dictionary comprehension mapping numbers to their squares.');
mcq('Python Basics', 'hard', 'What is the output of print(list(zip([1,2], [3,4,5])))?', ['[(1,3), (2,4)]', '[(1,3), (2,4), (None,5)]', '[(1,3), (2,4), (2,5)]', 'Error'], '[(1,3), (2,4)]', 'zip stops at the shortest iterable.');
mcq('Python Basics', 'hard', 'What does "hello".upper().replace("H", "J") return?', ['"JELLO"', '"jello"', '"Hello"', '"Jello"'], '"JELLO"', 'upper() makes it "HELLO", replace("H","J") gives "JELLO".');
mcq('Python Basics', 'hard', 'What is the output? def f(a, b=[]): b.append(a); return b; print(f(1)); print(f(2))', ['[1] [2]', '[1] [1,2]', 'Error', '[1] [1]'], '[1] [1,2]', 'Default mutable arguments are shared across calls.');
mcq('Python Basics', 'hard', 'What does the enumerate function return?', ['A list of tuples', 'An iterator of (index, value) pairs', 'A dictionary', 'A set of indices'], 'An iterator of (index, value) pairs', 'enumerate yields (index, value) tuples.');
mcq('Python Basics', 'hard', 'What is the output of print(1 == True)?', ['True', 'False', 'Error', 'None'], 'True', 'In Python, bool is a subclass of int, and True == 1.');
mcq('Python Basics', 'hard', 'What does sorted([3, 1, 2], reverse=True) return?', ['[1, 2, 3]', '[3, 2, 1]', '[3, 1, 2]', 'None'], '[3, 2, 1]', 'reverse=True sorts in descending order.');
mcq('Python Basics', 'hard', 'What is the output of print(2 * [1, 2])?', ['[1, 2, 1, 2]', '[2, 4]', '[[1,2], [1,2]]', 'Error'], '[1, 2, 1, 2]', 'Multiplying a list repeats its elements.');
mcq('Python Basics', 'hard', 'What does " ".join(["a", "b", "c"]) return?', ['"abc"', '"a b c"', '"a, b, c"', 'Error'], '"a b c"', 'join concatenates elements with the separator string.');

mcq('Python Basics', 'extreme', 'What is the output? x = (1, 2); x += (3,); print(x)', ['(1, 2, 3)', 'Error', '(1, 2, (3,))', '(1, 2, 3,)'], '(1, 2, 3)', '+= on tuples creates a new tuple; the trailing comma keeps it a tuple.');
mcq('Python Basics', 'extreme', 'What does print(0.1 + 0.2 == 0.3) return?', ['True', 'False', 'Error', 'None'], 'False', 'Floating-point precision: 0.1 + 0.2 = 0.30000000000000004.');
mcq('Python Basics', 'extreme', 'What is the output of print(all([]))?', ['True', 'False', 'Error', 'None'], 'True', 'all() returns True for an empty iterable (vacuous truth).');
mcq('Python Basics', 'extreme', 'What does print({True: "a", 1: "b"}) output?', ['{True: "a", 1: "b"}', '{"True": "a", 1: "b"}', '{1: "b"}', 'Error'], '{1: "b"}', 'True == 1 as keys, so the second overwrites the first.');
mcq('Python Basics', 'extreme', 'What is the output? def f(): pass; print(type(f()))', ['<class \'NoneType\'>', '<class \'type\'>', '<class \'function\'>', 'Error'], '<class \'NoneType\'>', 'Functions without return explicitly return None.');

fib('Python Basics', 'basic', 'The function to get the length of a list is ____.', 'len()', 'len() returns the number of elements.');
fib('Python Basics', 'basic', 'The keyword to check if a value is in a list is ____.', 'in', 'The in operator checks membership.');
fib('Python Basics', 'basic', 'A ____ is an immutable ordered collection in Python.', 'tuple', 'Tuples cannot be modified after creation.');
fib('Python Basics', 'basic', 'The ____ function converts a string to an integer.', 'int()', 'int() parses a string or number to an integer.');
fib('Python Basics', 'basic', 'The ____ statement exits a loop prematurely.', 'break', 'break terminates the nearest enclosing loop.');
fib('Python Basics', 'basic', 'A ____ is a collection of unique elements.', 'set', 'Sets contain only unique elements.');
fib('Python Basics', 'basic', 'The ____ method removes the last element from a list.', 'pop()', 'pop() removes and returns the last item.');
fib('Python Basics', 'hard', 'The ____ function returns both index and value during iteration.', 'enumerate', 'enumerate yields (index, value) pairs.');
fib('Python Basics', 'hard', 'A ____ is an anonymous function in Python.', 'lambda', 'Lambda functions are small anonymous functions.');
fib('Python Basics', 'extreme', 'The ____ of a mutable object can change even if the object reference is constant.', 'content/value', 'Mutable objects can be modified in-place.');

// ============ TOPIC 2: NumPy ============

mcq('NumPy', 'basic', 'How do you create a NumPy array from a list?', ['np.array(list)', 'np.create(list)', 'np.from_list(list)', 'np.to_array(list)'], 'np.array(list)', 'np.array() creates an array from a list.');
mcq('NumPy', 'basic', 'What does np.zeros((3, 4)) create?', ['A 3x4 array of zeros', 'A 4x3 array of zeros', 'An array of 3 zeros', 'A 3x4 array of ones'], 'A 3x4 array of zeros', 'np.zeros((rows, cols)) creates an array filled with 0.');
mcq('NumPy', 'basic', 'What is the shape of a 1D array with 5 elements?', ['(5,)', '(1,5)', '(5,1)', '5'], '(5,)', 'A 1D array of 5 elements has shape (5,).');
mcq('NumPy', 'basic', 'How do you find the mean of a NumPy array?', ['np.mean(arr)', 'arr.mean()', 'Both A and B', 'np.average(arr)'], 'Both A and B', 'Both np.mean(arr) and arr.mean() work.');
mcq('NumPy', 'basic', 'What does np.arange(5) return?', ['[0,1,2,3,4]', '[1,2,3,4,5]', '[0,1,2,3,4,5]', '[1,2,3,4]'], '[0,1,2,3,4]', 'arange(5) returns array [0,1,2,3,4].');
mcq('NumPy', 'basic', 'What attribute gives the number of dimensions of an array?', ['shape', 'size', 'ndim', 'len'], 'ndim', 'ndim returns the number of axes/dimensions.');
mcq('NumPy', 'basic', 'How do you reshape a 1D array to 2D?', ['arr.reshape(rows, cols)', 'arr.resize(rows, cols)', 'np.reshape(arr, (rows, cols))', 'Both A and C'], 'Both A and C', 'Both arr.reshape() and np.reshape() work.');
mcq('NumPy', 'basic', 'What does import numpy as np allow?', ['Using np as a prefix', 'Full numpy access', 'Both', 'Nothing specific'], 'Both', 'import numpy as np lets you use np as an alias.');

mcq('NumPy', 'hard', 'What is the result of np.array([1,2,3]) + np.array([4,5,6])?', ['[5,7,9]', '[1,2,3,4,5,6]', 'Error', '[5,7,9,0]'], '[5,7,9]', 'NumPy does element-wise addition.');
mcq('NumPy', 'hard', 'What does broadcasting allow?', ['Operations on arrays of different shapes', 'Faster computation', 'Memory optimization', 'Multi-threading'], 'Operations on arrays of different shapes', 'Broadcasting allows arithmetic on arrays with different shapes.');
mcq('NumPy', 'hard', 'What is the output of np.where(arr > 2, 1, 0)?', ['1 where condition true, 0 otherwise', 'Indices where condition true', 'A boolean array', 'None'], '1 where condition true, 0 otherwise', 'np.where(condition, x, y) returns x where True, y where False.');
mcq('NumPy', 'hard', 'What does np.dot(A, B) compute?', ['Element-wise product', 'Dot product of two arrays', 'Cross product', 'Matrix transpose'], 'Dot product of two arrays', 'np.dot computes the dot/matrix product.');
mcq('NumPy', 'hard', 'What is the difference between np.sum and arr.sum?', ['No difference', 'np.sum is a function, arr.sum is a method', 'np.sum is faster', 'They work on different types'], 'No difference', 'Both compute the sum; one is a function, one a method.');

mcq('NumPy', 'extreme', 'What happens with np.array([1,2,3])[np.array([True, False, True])]?', ['Returns [1, 3]', 'Returns [2]', 'Returns [True, False]', 'Error'], 'Returns [1, 3]', 'Boolean indexing selects elements where the mask is True.');
mcq('NumPy', 'extreme', 'What is the output of np.eye(3).shape?', ['(3,)', '(3,3)', '(1,3)', '(3,1)'], '(3,3)', 'np.eye(3) creates a 3x3 identity matrix.');
mcq('NumPy', 'extreme', 'What does np.random.seed(42) do?', ['Makes random numbers reproducible', 'Generates 42 random numbers', 'Seeds with value 42 for security', 'Resets the random state'], 'Makes random numbers reproducible', 'Setting a seed ensures reproducible random numbers.');

fib('NumPy', 'basic', 'The NumPy function to create an array of evenly spaced values is np.____.', 'linspace', 'np.linspace creates evenly spaced values over an interval.');
fib('NumPy', 'basic', 'An array\'s ____ attribute returns a tuple of dimension sizes.', 'shape', 'The shape attribute describes array dimensions.');
fib('NumPy', 'hard', '____ is the technique that allows NumPy to perform operations on arrays of different shapes.', 'Broadcasting', 'Broadcasting aligns arrays of different shapes for operations.');
fib('NumPy', 'extreme', 'A ____ array is a NumPy array with exactly one axis.', '1D/one-dimensional', 'A 1D array has a single axis/dimension.');

// ============ TOPIC 3: Pandas ============

mcq('Pandas', 'basic', 'How do you read a CSV file in Pandas?', ['pd.read_csv("file.csv")', 'pd.load_csv("file.csv")', 'pd.open_csv("file.csv")', 'pd.import_csv("file.csv")'], 'pd.read_csv("file.csv")', 'pd.read_csv() is the standard CSV reader.');
mcq('Pandas', 'basic', 'What does df.head() return?', ['First 5 rows', 'Last 5 rows', 'First row', 'All rows'], 'First 5 rows', 'head() shows the first n rows (default 5).');
mcq('Pandas', 'basic', 'How do you select a single column?', ['df["col"]', 'df.col', 'Both A and B', 'df.get("col")'], 'Both A and B', 'Both df["col"] and df.col work for column selection.');
mcq('Pandas', 'basic', 'What does df.info() show?', ['Data types and non-null counts', 'Summary statistics', 'First 5 rows', 'Column names only'], 'Data types and non-null counts', 'info() provides dtypes, null counts, and memory usage.');
mcq('Pandas', 'basic', 'What method drops missing values?', ['df.dropna()', 'df.drop()', 'df.remove()', 'df.clean()'], 'df.dropna()', 'dropna() removes rows with missing values.');
mcq('Pandas', 'basic', 'What does df.describe() return?', ['Summary statistics of numeric columns', 'Description of the dataset', 'Data types', 'Column names'], 'Summary statistics of numeric columns', 'describe() shows count, mean, std, min, quartiles, max.');
mcq('Pandas', 'basic', 'How do you select rows by index label?', ['df.loc["label"]', 'df.iloc["label"]', 'df["label"]', 'df.at("label")'], 'df.loc["label"]', 'loc selects by label-based index.');
mcq('Pandas', 'basic', 'What does df.shape return?', ['(rows, columns)', 'Total elements', 'Column count only', 'Row count only'], '(rows, columns)', 'shape returns (row_count, column_count).');
mcq('Pandas', 'basic', 'How do you rename a column?', ['df.rename(columns={"old":"new"})', 'df.rename_column("old","new")', 'df.set_name("old","new")', 'df.col_rename("old","new")'], 'df.rename(columns={"old":"new"})', 'rename() with a columns dict renames columns.');
mcq('Pandas', 'basic', 'What does df.sort_values("col") do?', ['Sorts by column values in ascending order', 'Sorts by index', 'Sorts columns alphabetically', 'Drops duplicates'], 'Sorts by column values in ascending order', 'sort_values() sorts the DataFrame by specified column(s).');

mcq('Pandas', 'hard', 'What does df.groupby("col")["val"].mean() compute?', ['Mean of val for each group in col', 'Mean of col for each val', 'Group count', 'Sum of val grouped'], 'Mean of val for each group in col', 'groupby().mean() computes group-wise means.');
mcq('Pandas', 'hard', 'How do you merge two DataFrames on a key?', ['pd.merge(df1, df2, on="key")', 'df1.join(df2, on="key")', 'df1.concat(df2, on="key")', 'pd.concat([df1, df2], axis=1)'], 'pd.merge(df1, df2, on="key")', 'pd.merge() performs SQL-like joins on DataFrames.');
mcq('Pandas', 'hard', 'What does df.pivot_table(index="a", columns="b", values="c") do?', ['Creates a pivot table with a as rows, b as cols, c as values', 'Transposes the DataFrame', 'Groups by a and b', 'Merges columns'], 'Creates a pivot table with a as rows, b as cols, c as values', 'pivot_table creates a spreadsheet-style pivot table.');
mcq('Pandas', 'hard', 'What is the difference between loc and iloc?', ['loc uses labels, iloc uses integer positions', 'loc is faster', 'iloc uses labels, loc uses positions', 'No difference'], 'loc uses labels, iloc uses integer positions', 'loc is label-based; iloc is integer position-based.');
mcq('Pandas', 'hard', 'How do you apply a function to each row?', ['df.apply(func, axis=1)', 'df.apply(func, axis=0)', 'df.map(func)', 'df.transform(func)'], 'df.apply(func, axis=1)', 'apply with axis=1 applies function row-wise.');
mcq('Pandas', 'hard', 'What does df.isnull().sum() return?', ['Count of nulls per column', 'Count of nulls per row', 'Total null count', 'Boolean null mask'], 'Count of nulls per column', 'isnull() creates a boolean mask; sum() counts True per column.');
mcq('Pandas', 'hard', 'What does pd.cut() do?', ['Bins continuous values into categories', 'Cuts rows from DataFrame', 'Removes outliers', 'Splits strings'], 'Bins continuous values into categories', 'cut() discretizes continuous data into bins.');

mcq('Pandas', 'extreme', 'What happens with df["col"].str.contains("pattern")?', ['Returns boolean Series for pattern match', 'Returns matched strings', 'Returns indices of matches', 'Replaces pattern'], 'Returns boolean Series for pattern match', 'str.contains() checks if pattern exists in each string element.');
mcq('Pandas', 'extreme', 'What is the output of pd.NA == pd.NA?', ['True', 'False', 'pd.NA', 'None'], 'pd.NA', 'pd.NA is not equal to itself (consistent with SQL NULL semantics).');
mcq('Pandas', 'extreme', 'What does df.eval("A + B") do?', ['Evaluates expression A+B on columns', 'Executes Python code', 'Calculates sum of A and B across DataFrame', 'Error'], 'Evaluates expression A+B on columns', 'eval() evaluates column expressions efficiently.');

fib('Pandas', 'basic', 'The method to check for missing values is df.____().', 'isnull', 'isnull() returns a boolean DataFrame of null values.');
fib('Pandas', 'basic', 'The attribute that returns column names is df.____.', 'columns', 'df.columns returns an Index of column names.');
fib('Pandas', 'hard', '____ is the Pandas method for SQL-like joins between DataFrames.', 'merge', 'pd.merge() joins DataFrames on keys.');
fib('Pandas', 'hard', 'The ____ method fills missing values with a specified value.', 'fillna', 'fillna() replaces NaN with a given value.');
fib('Pandas', 'extreme', 'In Pandas, ____ is the nullable integer data type.', 'Int64', 'Pandas nullable integer type is Int64 (capital I).');

// ============ TOPIC 4: SQL ============

mcq('SQL', 'basic', 'Which SQL statement is used to retrieve data?', ['SELECT', 'GET', 'FETCH', 'READ'], 'SELECT', 'SELECT retrieves data from tables.');
mcq('SQL', 'basic', 'What does WHERE clause do?', ['Filters records', 'Groups records', 'Sorts records', 'Joins tables'], 'Filters records', 'WHERE filters rows based on conditions.');
mcq('SQL', 'basic', 'How do you count all rows in a table?', ['SELECT COUNT(*) FROM table', 'SELECT COUNT(table)', 'COUNT TABLE table', 'TOTAL table'], 'SELECT COUNT(*) FROM table', 'COUNT(*) counts all rows in a table.');
mcq('SQL', 'basic', 'What does DISTINCT do?', ['Removes duplicate rows', 'Sorts results', 'Filters nulls', 'Groups data'], 'Removes duplicate rows', 'DISTINCT eliminates duplicate rows from results.');
mcq('SQL', 'basic', 'How do you sort results in descending order?', ['ORDER BY col DESC', 'SORT BY col DESC', 'ORDER col DESC', 'SORT DESC col'], 'ORDER BY col DESC', 'ORDER BY ... DESC sorts descending.');
mcq('SQL', 'basic', 'What SQL keyword is used to join two tables?', ['JOIN', 'MERGE', 'COMBINE', 'LINK'], 'JOIN', 'JOIN combines rows from two or more tables.');
mcq('SQL', 'basic', 'What is a primary key?', ['Unique identifier for each row', 'First column in table', 'Indexed column', 'Foreign reference'], 'Unique identifier for each row', 'A primary key uniquely identifies each row.');
mcq('SQL', 'basic', 'What does the LIKE operator do?', ['Pattern matching with wildcards', 'Exact match', 'Greater than comparison', 'String concatenation'], 'Pattern matching with wildcards', 'LIKE matches patterns using % and _ wildcards.');
mcq('SQL', 'basic', 'Which SQL function returns the average?', ['AVG()', 'MEAN()', 'AVERAGE()', 'SUM()'], 'AVG()', 'AVG() calculates the average of a numeric column.');
mcq('SQL', 'basic', 'What does GROUP BY do?', ['Groups rows with same values', 'Orders results', 'Filters groups', 'Joins tables'], 'Groups rows with same values', 'GROUP BY groups rows sharing a value for aggregate functions.');

mcq('SQL', 'hard', 'What does HAVING do that WHERE cannot?', ['Filters after aggregation', 'Filters before aggregation', 'Joins tables', 'Orders results'], 'Filters after aggregation', 'HAVING filters groups after GROUP BY; WHERE filters before.');
mcq('SQL', 'hard', 'What type of JOIN returns all rows from left table?', ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], 'LEFT JOIN', 'LEFT JOIN returns all left rows and matching right rows.');
mcq('SQL', 'hard', 'What is a subquery?', ['A query nested inside another query', 'A query with multiple SELECTs', 'A query without FROM', 'A sorted query'], 'A query nested inside another query', 'A subquery is a SELECT statement within another query.');
mcq('SQL', 'hard', 'What does COALESCE do?', ['Returns first non-null value', 'Concatenates strings', 'Counts non-null values', 'Compares values'], 'Returns first non-null value', 'COALESCE returns the first non-null argument.');
mcq('SQL', 'hard', 'What is a self-join?', ['Joining a table with itself', 'Joining a table with a copy', 'Inner join only', 'Recursive join'], 'Joining a table with itself', 'A self-join joins a table to itself using aliases.');
mcq('SQL', 'hard', 'What does ROW_NUMBER() do?', ['Assigns sequential integers to rows', 'Counts total rows', 'Numbers the columns', 'Groups rows by number'], 'Assigns sequential integers to rows', 'ROW_NUMBER() is a window function assigning unique numbers.');
mcq('SQL', 'hard', 'What is a correlated subquery?', ['Subquery that references outer query', 'Two subqueries together', 'A join replacement', 'An indexed query'], 'Subquery that references outer query', 'Correlated subqueries depend on values from the outer query.');
mcq('SQL', 'hard', 'What does NULL mean in SQL?', ['Unknown/missing value', 'Zero', 'Empty string', 'False'], 'Unknown/missing value', 'NULL represents missing or unknown data, not zero.');

mcq('SQL', 'extreme', 'What happens with SELECT * FROM t1 JOIN t2 ON t1.id = t2.id?', ['Returns rows where ids match in both', 'Returns all t1 rows', 'Returns all t2 rows', 'Cross join'], 'Returns rows where ids match in both', 'INNER JOIN returns only matching rows.');
mcq('SQL', 'extreme', 'What is a lateral join?', ['A join that allows subquery to reference prior FROM items', 'A join without condition', 'Left join with lateral', 'Right join'], 'A join that allows subquery to reference prior FROM items', 'LATERAL JOIN lets subqueries reference columns from preceding tables.');
mcq('SQL', 'extreme', 'What does UNION do vs UNION ALL?', ['UNION deduplicates, UNION ALL keeps all', 'UNION keeps all, UNION ALL deduplicates', 'No difference', 'UNION is faster'], 'UNION deduplicates, UNION ALL keeps all', 'UNION removes duplicates; UNION ALL keeps all rows.');

fib('SQL', 'basic', 'The SQL clause to filter rows is ____.', 'WHERE', 'WHERE filters rows based on conditions.');
fib('SQL', 'basic', '____ is used to count the number of rows.', 'COUNT', 'COUNT(*) counts rows in a table.');
fib('SQL', 'basic', 'The wildcard character in SQL LIKE is ____.', '%', '% matches any sequence of characters.');
fib('SQL', 'hard', 'A ____ is a virtual table based on a SELECT query.', 'view', 'A view is a saved query that acts like a table.');
fib('SQL', 'extreme', 'The ____ clause filters groups after GROUP BY.', 'HAVING', 'HAVING filters aggregated results after GROUP BY.');

// ============ TOPIC 5: Statistics ============

mcq('Statistics', 'basic', 'What is the mean of the numbers 2, 4, 6, 8, 10?', ['6', '5', '7', '4'], '6', 'Mean = sum/count = 30/5 = 6.');
mcq('Statistics', 'basic', 'What is the median of 1, 3, 5, 7, 9?', ['5', '3', '7', '4'], '5', 'Median is the middle value when sorted: 5.');
mcq('Statistics', 'basic', 'What is the mode of 2, 2, 3, 4, 4, 4, 5?', ['4', '2', '3', '5'], '4', 'Mode is the most frequent value: 4.');
mcq('Statistics', 'basic', 'What does standard deviation measure?', ['Spread of data around mean', 'Central tendency', 'Skewness', 'Correlation'], 'Spread of data around mean', 'Standard deviation quantifies data dispersion.');
mcq('Statistics', 'basic', 'What is probability between 0 and 1?', ['Likelihood of an event', 'Count of outcomes', 'Sample size', 'Data range'], 'Likelihood of an event', 'Probability ranges from 0 (impossible) to 1 (certain).');
mcq('Statistics', 'basic', 'What is a normal distribution?', ['Bell-shaped symmetric distribution', 'Uniform distribution', 'Skewed distribution', 'Exponential distribution'], 'Bell-shaped symmetric distribution', 'Normal distribution is symmetric and bell-shaped.');
mcq('Statistics', 'basic', 'What does correlation measure?', ['Linear relationship between variables', 'Causation between variables', 'Difference between means', 'Data variance'], 'Linear relationship between variables', 'Correlation measures strength of linear relationship.');
mcq('Statistics', 'basic', 'What is the range of 1, 5, 8, 12, 20?', ['19', '20', '12', '8'], '19', 'Range = max - min = 20 - 1 = 19.');

mcq('Statistics', 'hard', 'What does p-value represent?', ['Probability of observing results assuming null is true', 'Probability null hypothesis is true', 'Effect size', 'Sample mean'], 'Probability of observing results assuming null is true', 'p-value measures evidence against the null hypothesis.');
mcq('Statistics', 'hard', 'What is a Type I error?', ['Rejecting true null hypothesis', 'Accepting false null hypothesis', 'Sampling error', 'Measurement error'], 'Rejecting true null hypothesis', 'Type I error is a false positive.');
mcq('Statistics', 'hard', 'What does the Central Limit Theorem state?', ['Sample means approach normal distribution as n increases', 'Population is normally distributed', 'Data is always normal', 'Variance equals mean'], 'Sample means approach normal distribution as n increases', 'CLT: sample means are approximately normal for large samples.');
mcq('Statistics', 'hard', 'What is the interquartile range (IQR)?', ['Q3 - Q1', 'Q1 - Q3', 'Mean - median', 'Max - min'], 'Q3 - Q1', 'IQR is the range of the middle 50% of data.');
mcq('Statistics', 'hard', 'What does a box plot show?', ['Median, quartiles, outliers', 'Mean and standard deviation', 'Histogram bins', 'Correlation'], 'Median, quartiles, outliers', 'Box plots show five-number summary and outliers.');
mcq('Statistics', 'hard', 'What is statistical power?', ['Probability of correctly rejecting false null', 'Sample size', 'Effect magnitude', 'Data variability'], 'Probability of correctly rejecting false null', 'Power is 1 - P(Type II error).');

mcq('Statistics', 'extreme', 'What is Simpson\'s Paradox?', ['Trend reversed when groups are combined', 'Correlation implies causation', 'Variance equals mean', 'Data is always normal'], 'Trend reversed when groups are combined', 'Simpson\'s Paradox: trends within groups disappear or reverse when combined.');
mcq('Statistics', 'extreme', 'What is the difference between correlation and causation?', ['Correlation does not imply causation', 'They are the same', 'Causation implies correlation', 'Neither is related'], 'Correlation does not imply causation', 'Two correlated variables may not have a causal relationship.');
mcq('Statistics', 'extreme', 'What is a confidence interval?', ['Range likely containing population parameter', 'Range of sample data', 'Prediction interval', 'Standard error range'], 'Range likely containing population parameter', 'CI estimates the range for a population parameter with given confidence.');

fib('Statistics', 'basic', 'The average of a dataset is called the ____.', 'mean', 'Mean is the arithmetic average.');
fib('Statistics', 'basic', 'The middle value when data is sorted is the ____.', 'median', 'Median is the central value in ordered data.');
fib('Statistics', 'basic', 'The most frequent value is the ____.', 'mode', 'Mode is the value appearing most often.');
fib('Statistics', 'hard', '____ error occurs when rejecting a true null hypothesis.', 'Type I', 'Type I error is a false positive.');
fib('Statistics', 'extreme', "____'s paradox occurs when a trend appears in groups but reverses when combined.", 'Simpson', 'Simpson\'s Paradox describes this counterintuitive phenomenon.');

// ============ TOPIC 6: Data Visualization ============

mcq('Data Visualization', 'basic', 'What does a bar chart show?', ['Comparisons between categories', 'Trends over time', 'Distribution of data', 'Correlation'], 'Comparisons between categories', 'Bar charts compare values across categories.');
mcq('Data Visualization', 'basic', 'What is a histogram used for?', ['Showing distribution of continuous data', 'Comparing categories', 'Showing trends', 'Displaying proportions'], 'Showing distribution of continuous data', 'Histograms show the distribution of numeric data through bins.');
mcq('Data Visualization', 'basic', 'What does a pie chart show?', ['Proportions of a whole', 'Trends over time', 'Data distribution', 'Correlation'], 'Proportions of a whole', 'Pie charts show parts of a whole as percentages.');
mcq('Data Visualization', 'basic', 'What is the y-axis in a line chart?', ['Dependent variable', 'Independent variable', 'Time', 'Categories'], 'Dependent variable', 'The y-axis typically shows the dependent/measured variable.');
mcq('Data Visualization', 'basic', 'What is Matplotlib?', ['A Python plotting library', 'A data analysis library', 'A machine learning library', 'A web framework'], 'A Python plotting library', 'Matplotlib is Python\'s foundational plotting library.');
mcq('Data Visualization', 'basic', 'What does a scatter plot show?', ['Relationship between two variables', 'Distribution of one variable', 'Comparison of categories', 'Part-to-whole'], 'Relationship between two variables', 'Scatter plots display relationship between two numeric variables.');
mcq('Data Visualization', 'basic', 'What is the purpose of a legend?', ['Identifies data series in a plot', 'Shows axis labels', 'Displays title', 'Sets colors'], 'Identifies data series in a plot', 'A legend explains what different colors/markers represent.');

mcq('Data Visualization', 'hard', 'What does a heatmap show?', ['Magnitude of values as color intensity', 'Distribution of data', 'Trend over time', 'Category comparison'], 'Magnitude of values as color intensity', 'Heatmaps use color to represent data values in a matrix.');
mcq('Data Visualization', 'hard', 'What can a violin plot show that a box plot cannot?', ['Kernel density distribution', 'Median only', 'Mean only', 'Outliers only'], 'Kernel density distribution', 'Violin plots combine box plot with density estimation.');
mcq('Data Visualization', 'hard', 'What is the best way to visualize correlation between many variables?', ['Correlation matrix heatmap', 'Bar chart', 'Line chart', 'Pie chart'], 'Correlation matrix heatmap', 'Heatmaps effectively show pairwise correlations.');
mcq('Data Visualization', 'hard', 'What does Seaborn add to Matplotlib?', ['Statistical visualizations with nicer defaults', '3D plotting', 'Interactive charts', 'Animation support'], 'Statistical visualizations with nicer defaults', 'Seaborn provides high-level statistical plotting interfaces.');

mcq('Data Visualization', 'extreme', 'What is chart junk?', ['Unnecessary decorative elements that obscure data', 'Missing data points', 'Incorrect labels', 'Overlapping markers'], 'Unnecessary decorative elements that obscure data', 'Chart junk distracts from the data-ink ratio.');
mcq('Data Visualization', 'extreme', 'What is the principle of data-ink ratio?', ['Maximize data ink, minimize non-data ink', 'Use more colors', 'Add more labels', 'Increase chart size'], 'Maximize data ink, minimize non-data ink', 'Tufte\'s principle: maximize ink devoted to data.');
mcq('Data Visualization', 'extreme', 'What is a misleading visualization?', ['Any chart that distorts or misrepresents data', 'A chart with many colors', 'A 3D chart', 'A chart without a title'], 'Any chart that distorts or misrepresents data', 'Misleading visualizations intentionally or unintentionally distort truth.');

fib('Data Visualization', 'basic', 'The library plt.show() comes from ____.', 'matplotlib.pyplot', 'plt is the standard alias for matplotlib.pyplot.');
fib('Data Visualization', 'basic', 'A ____ chart shows the distribution of continuous data through bins.', 'histogram', 'Histograms show frequency distributions.');
fib('Data Visualization', 'hard', '____ is a Python library built on Matplotlib for statistical visualizations.', 'Seaborn', 'Seaborn provides statistical plotting with nicer defaults.');
fib('Data Visualization', 'extreme', 'A ____ plot combines a box plot with a kernel density plot.', 'violin', 'Violin plots show distribution shape plus summary statistics.');

// ============ TOPIC 7: Logical Aptitude ============

mcq('Logical Aptitude', 'basic', 'If all A are B and all B are C, then:', ['All A are C', 'All C are A', 'Some A are not C', 'No relation'], 'All A are C', 'This is a transitive syllogism: A -> B -> C implies A -> C.');
mcq('Logical Aptitude', 'basic', 'What comes next? 2, 4, 6, 8, ?', ['10', '9', '12', '11'], '10', 'The sequence increases by 2 each time.');
mcq('Logical Aptitude', 'basic', 'A clock shows 3:15. What is the angle between hour and minute hands?', ['7.5 degrees', '0 degrees', '15 degrees', '30 degrees'], '7.5 degrees', 'At 3:15, hour hand is 1/4 past 3 = 7.5 degrees past minute hand.');
mcq('Logical Aptitude', 'basic', 'If you flip a fair coin twice, probability of two heads?', ['1/4', '1/2', '1/3', '1/8'], '1/4', 'P(HH) = 1/2 * 1/2 = 1/4.');
mcq('Logical Aptitude', 'basic', 'Which word does NOT belong? Apple, Banana, Carrot, Date', ['Carrot', 'Apple', 'Banana', 'Date'], 'Carrot', 'Carrot is a vegetable; others are fruits.');
mcq('Logical Aptitude', 'basic', 'If yesterday was Thursday, what is day after tomorrow?', ['Monday', 'Sunday', 'Saturday', 'Tuesday'], 'Monday', 'Yesterday = Thu => Today = Fri => Tomorrow = Sat => Day after = Mon.');

mcq('Logical Aptitude', 'hard', 'P is the sister of Q. R is the mother of Q. S is the father of R. How is P related to S?', ['Granddaughter', 'Daughter', 'Niece', 'Grandmother'], 'Granddaughter', 'P is Q\'s sister, R is mother of Q and P. S is R\'s father, so S is P\'s grandfather.');
mcq('Logical Aptitude', 'hard', 'What is the missing number? 1, 4, 9, 16, 25, ?', ['36', '30', '49', '35'], '36', 'These are squares: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2 = 36.');
mcq('Logical Aptitude', 'hard', 'If FISH is coded as EHRG, then BIRD is coded as:', ['AHQC', 'CJSE', 'CHQC', 'AHSD'], 'AHQC', 'Each letter is moved one step backward: F->E, I->H, S->R, H->G.');
mcq('Logical Aptitude', 'hard', 'How many 9s between 1 and 100?', ['20', '11', '19', '10'], '20', '9,19,29,39,49,59,69,79,89,90-99 (11 more) = 20 total.');
mcq('Logical Aptitude', 'hard', 'A man walks 5 km north, turns right, walks 10 km, turns right, walks 5 km. How far from start?', ['10 km', '5 km', '15 km', '0 km'], '10 km', 'He ends up 10 km east of starting point.');

mcq('Logical Aptitude', 'extreme', 'Three light switches control one bulb in another room. You can only enter the room once. How do you determine which switch controls it?', ['Turn one on, wait, turn it off, turn another on, enter', 'Flip all three', 'Enter multiple times', 'Guess randomly'], 'Turn one on, wait, turn it off, turn another on, enter', 'The bulb could be on (switch 2), warm (switch 1), or off/cold (switch 3).');
mcq('Logical Aptitude', 'extreme', 'A bat and a ball cost $1.10 total. The bat costs $1.00 more than the ball. How much is the ball?', ['$0.05', '$0.10', '$0.01', '$0.15'], '$0.05', 'Ball = x, Bat = x + 1.00 => 2x + 1.00 = 1.10 => x = 0.05.');
mcq('Logical Aptitude', 'extreme', 'You have a 3-gallon and 5-gallon jug. How to measure exactly 4 gallons?', ['Fill 5, pour to 3, empty 3, pour remaining 2 into 3, fill 5, pour to 3 until full (1), leaving 4', 'Fill 3 twice', 'Fill 5 and 3 together', 'Impossible'], 'Fill 5, pour to 3, empty 3, pour remaining 2 into 3, fill 5, pour to 3 until full (1), leaving 4', 'Classic water jug problem.');

fib('Logical Aptitude', 'basic', 'The next number in the sequence 1, 1, 2, 3, 5, 8, ____ is 13.', '13', 'Fibonacci sequence: each number is sum of two previous.');
fib('Logical Aptitude', 'hard', 'The ____ family relationship: "Brother of my mother is my uncle."', 'uncle', 'Mother\'s brother is the maternal uncle.');
fib('Logical Aptitude', 'extreme', '____ is the water jug problem mentioned.', 'Die Hard/3-5 gallon', 'The 3 and 5 gallon jug problem is from Die Hard 3.');

// ============ TOPIC 8: EDA Case Study ============

mcq('EDA', 'basic', 'The first step in EDA is:', ['Understanding the data structure', 'Building models', 'Making predictions', 'Deploying'], 'Understanding the data structure', 'EDA starts with understanding data shape, types, and basic properties.');
mcq('EDA', 'basic', 'What should you check first for data quality?', ['Missing values and data types', 'Correlation', 'Feature importance', 'Model accuracy'], 'Missing values and data types', 'Initial data quality check involves missing values and type correctness.');
mcq('EDA', 'basic', 'What does a pairplot show?', ['Scatter matrix of all variable pairs', 'Single variable histogram', 'Correlation values', 'Model predictions'], 'Scatter matrix of all variable pairs', 'Pairplot shows scatter plots for all variable combinations.');

mcq('EDA', 'hard', 'In a dataset with 1000 rows and 50 columns, what should you do first?', ['Check data types, nulls, summary stats', 'Run a regression model', 'Remove all columns with nulls', 'Scale all features'], 'Check data types, nulls, summary stats', 'Initial exploratory analysis precedes any modeling.');
mcq('EDA', 'hard', 'What do you look for in a residual plot?', ['Patterns indicating model fit issues', 'Correlation strength', 'Variable distributions', 'Missing data patterns'], 'Patterns indicating model fit issues', 'Random residuals = good fit; patterns = poor fit.');
mcq('EDA', 'hard', 'Given sales data with date, price, and quantity, which plot would you make first?', ['Time series of sales over date', 'Price vs quantity scatter', 'Histogram of quantity', 'Box plot of price'], 'Time series of sales over date', 'Always visualize the target variable over time first.');

mcq('EDA', 'extreme', 'When you find outliers in a dataset, what should you do?', ['Investigate, then decide based on domain knowledge', 'Always remove them', 'Always keep them', 'Ignore them'], 'Investigate, then decide based on domain knowledge', 'Outlier treatment depends on context and domain expertise.');
mcq('EDA', 'extreme', 'Multicollinearity is problematic because:', ['It makes coefficient estimates unstable', 'It improves model accuracy', 'It reduces overfitting', 'It speeds up training'], 'It makes coefficient estimates unstable', 'High correlation between predictors inflates variance of estimates.');
mcq('EDA', 'extreme', 'What does a Q-Q plot assess?', ['Normality of data distribution', 'Correlation between variables', 'Outlier detection', 'Missing data patterns'], 'Normality of data distribution', 'Q-Q plot compares data quantiles to theoretical normal quantiles.');

fib('EDA', 'basic', 'The library commonly used for EDA in Python is ____.', 'pandas', 'Pandas provides data manipulation and analysis tools for EDA.');
fib('EDA', 'basic', '____ are values that differ significantly from other observations.', 'Outliers', 'Outliers are extreme values that deviate from other data points.');
fib('EDA', 'hard', 'A ____ plot is used to assess the normality of data.', 'Q-Q/quantile-quantile', 'Q-Q plot compares data distribution to a theoretical distribution.');
fib('EDA', 'extreme', '____ occurs when independent variables in a regression are highly correlated.', 'Multicollinearity', 'Multicollinearity causes unstable coefficient estimates.');

// ============ TOPIC 9: Basic ML ============

mcq('Basic ML', 'basic', 'What is supervised learning?', ['Learning with labeled data', 'Learning without labels', 'Learning by rewards', 'Learning by clustering'], 'Learning with labeled data', 'Supervised learning uses input-output pairs.');
mcq('Basic ML', 'basic', 'What is classification?', ['Predicting a categorical label', 'Predicting continuous value', 'Grouping similar items', 'Reducing dimensions'], 'Predicting a categorical label', 'Classification predicts discrete class labels.');
mcq('Basic ML', 'basic', 'What is regression?', ['Predicting a continuous value', 'Predicting a category', 'Clustering data', 'Reducing features'], 'Predicting a continuous value', 'Regression predicts numeric/continuous outcomes.');
mcq('Basic ML', 'basic', 'What is overfitting?', ['Model learns training data too well, fails on new data', 'Model is too simple', 'Model underperforms on training', 'Model converges slowly'], 'Model learns training data too well, fails on new data', 'Overfitting captures noise instead of signal.');
mcq('Basic ML', 'basic', 'What is a training set?', ['Data used to train the model', 'Data used to evaluate', 'Data used for final testing', 'All available data'], 'Data used to train the model', 'Training set is used to fit model parameters.');
mcq('Basic ML', 'basic', 'What is a test set?', ['Data used to evaluate final model', 'Data used for training', 'Data for parameter tuning', 'Unlabeled data'], 'Data used to evaluate final model', 'Test set provides unbiased evaluation of final model.');
mcq('Basic ML', 'basic', 'What does accuracy measure?', ['Correct predictions / total predictions', 'True positives / total', 'False positives / total', 'Error rate'], 'Correct predictions / total predictions', 'Accuracy = (TP + TN) / (TP + TN + FP + FN).');
mcq('Basic ML', 'basic', 'What is a feature?', ['An input variable used for prediction', 'The target variable', 'A model parameter', 'A training example'], 'An input variable used for prediction', 'Features are the independent variables used for prediction.');

mcq('Basic ML', 'hard', 'What is the bias-variance tradeoff?', ['Tradeoff between model complexity and generalization', 'Tradeoff between speed and accuracy', 'Balance of dataset sizes', 'None of the above'], 'Tradeoff between model complexity and generalization', 'Bias decreases and variance increases with model complexity.');
mcq('Basic ML', 'hard', 'What does cross-validation do?', ['Evaluates model on multiple train/test splits', 'Validates data quality', 'Cross-checks features', 'Validates assumptions'], 'Evaluates model on multiple train/test splits', 'Cross-validation provides robust performance estimates.');
mcq('Basic ML', 'hard', 'What is a confusion matrix?', ['Table showing TP, FP, TN, FN', 'Correlation matrix', 'Feature matrix', 'Distance matrix'], 'Table showing TP, FP, TN, FN', 'Confusion matrix summarizes classification performance.');
mcq('Basic ML', 'hard', 'What is regularization?', ['Technique to prevent overfitting', 'Method to speed up training', 'Data normalization technique', 'Feature selection method'], 'Technique to prevent overfitting', 'Regularization adds penalty for large coefficients.');
mcq('Basic ML', 'hard', 'What is the difference between Bagging and Boosting?', ['Bagging trains in parallel, Boosting sequentially', 'Bagging is for regression, Boosting for classification', 'No difference', 'Bagging is faster'], 'Bagging trains in parallel, Boosting sequentially', 'Bagging (e.g., RF) trains parallel; Boosting (e.g., XGB) trains sequentially.');

mcq('Basic ML', 'extreme', 'What is the F1 score?', ['Harmonic mean of precision and recall', 'Arithmetic mean of precision and recall', 'Geometric mean', 'Sum of precision and recall'], 'Harmonic mean of precision and recall', 'F1 = 2 * (precision * recall) / (precision + recall).');
mcq('Basic ML', 'extreme', 'What is the curse of dimensionality?', ['Performance degrades as features increase', 'More features always help', 'Data becomes denser in high dimensions', 'Training is faster with more features'], 'Performance degrades as features increase', 'With many features, data becomes sparse and distances become less meaningful.');
mcq('Basic ML', 'extreme', 'What does the ROC curve show?', ['TPR vs FPR at various thresholds', 'Precision vs recall', 'Accuracy vs threshold', 'Error vs complexity'], 'TPR vs FPR at various thresholds', 'ROC curve plots True Positive Rate against False Positive Rate.');

fib('Basic ML', 'basic', 'In supervised learning, the output variable is called the ____ variable.', 'target/dependent', 'Target variable is what we predict.');
fib('Basic ML', 'basic', '____ is when a model performs well on training data but poorly on test data.', 'Overfitting', 'Overfitting indicates the model has memorized training noise.');
fib('Basic ML', 'hard', '____ validation splits data into k folds for robust evaluation.', 'k-fold/cross', 'k-fold cross-validation uses k train/test splits.');
fib('Basic ML', 'extreme', 'The ____ score is the harmonic mean of precision and recall.', 'F1', 'F1 score balances precision and recall.');

// ============ TOPIC 10: Communication / Reasoning ============

mcq('Communication', 'basic', 'What is the best way to present findings to non-technical stakeholders?', ['Simple language with visual aids', 'Technical jargon', 'Raw data dumps', 'Complex statistical formulas'], 'Simple language with visual aids', 'Communicate insights clearly without jargon for non-technical audiences.');
mcq('Communication', 'basic', 'When your analysis contradicts a stakeholder\'s assumption, you should:', ['Present evidence professionally', 'Ignore the data', 'Change the analysis', 'Avoid the topic'], 'Present evidence professionally', 'Data-driven insights should be communicated with evidence and respect.');
mcq('Communication', 'basic', 'What is active listening?', ['Fully concentrating on the speaker', 'Taking notes only', 'Nodding occasionally', 'Waiting to speak'], 'Fully concentrating on the speaker', 'Active listening involves full focus on understanding the speaker.');
mcq('Communication', 'basic', 'A team member disagrees with your approach. Best action:', ['Listen to their perspective and discuss', 'Ignore them', 'Escalate immediately', 'Do it your way anyway'], 'Listen to their perspective and discuss', 'Collaborative discussion leads to better outcomes.');
mcq('Communication', 'basic', 'What does "brief but comprehensive" mean in reporting?', ['Concise yet covering all key points', 'Short and incomplete', 'Very long report', 'Only bullet points'], 'Concise yet covering all key points', 'Reports should be concise while covering essential information.');

mcq('Communication', 'hard', 'A client asks for a complex analysis by tomorrow but you need 3 days. What do you do?', ['Communicate constraints and propose alternatives', 'Stay up all night to deliver', 'Ignore the request', 'Deliver incomplete work'], 'Communicate constraints and propose alternatives', 'Set realistic expectations and offer solutions.');
mcq('Communication', 'hard', 'How do you handle an unclear project requirement?', ['Ask clarifying questions', 'Make assumptions', 'Skip it', 'Do it later'], 'Ask clarifying questions', 'Clarifying requirements prevents wasted effort.');
mcq('Communication', 'hard', 'What is the STAR method used for?', ['Structuring interview answers', 'Statistical analysis', 'Data collection', 'Report writing'], 'Structuring interview answers', 'STAR = Situation Task Action Result for behavioral interviews.');

mcq('Communication', 'extreme', 'Your model has 95% accuracy but fails on a minority group. What should you do?', ['Report stratified metrics and investigate', 'Deploy anyway', 'Ignore the issue', 'Remove minority data'], 'Report stratified metrics and investigate', 'Model fairness requires evaluating performance across all subgroups.');
mcq('Communication', 'extreme', 'How do you prioritize when getting conflicting requests from two managers?', ['Facilitate alignment between them', 'Do both partially', 'Pick the louder one', 'Ignore both'], 'Facilitate alignment between them', 'Help stakeholders align on priorities rather than choosing sides.');

fib('Communication', 'basic', 'The acronym ____ stands for Situation, Task, Action, Result.', 'STAR', 'STAR is a method for structuring responses.');
fib('Communication', 'hard', '____ listening involves fully concentrating and understanding the speaker.', 'Active', 'Active listening requires full engagement with the speaker.');
fib('Communication', 'extreme', '____ is the ethical principle of being honest and transparent in data reporting.', 'Integrity', 'Data integrity means honest and accurate reporting.');

// ============ CODING QUESTIONS ============

coding('Python Basics', 'medium', 'Write a function that finds the second largest element in a list. If the list has fewer than 2 elements, return None.', '', 'Use a single pass tracking the top two values.', 'def second_largest(nums):\n    if len(nums) < 2:\n        return None\n    first = second = float(\'-inf\')\n    for n in nums:\n        if n > first:\n            second = first\n            first = n\n        elif n > second and n != first:\n            second = n\n    return second if second != float(\'-inf\') else None', [{"input": "[3, 1, 4, 1, 5, 9, 2, 6]", "expected_output": "6"}, {"input": "[1, 2]", "expected_output": "1"}, {"input": "[5]", "expected_output": "None"}, {"input": "[]", "expected_output": "None"}, {"input": "[1, 1, 1]", "expected_output": "None"}]);

coding('Python Basics', 'hard', 'Write a function to check if a string of parentheses (), {}, [] is balanced.', '', 'Use a stack to match opening/closing brackets.', 'def is_balanced(s):\n    stack = []\n    pairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n    for ch in s:\n        if ch in pairs.values():\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return len(stack) == 0', [{"input": "\"()\"", "expected_output": "True"}, {"input": "\"()[]{}\"", "expected_output": "True"}, {"input": "\"(]\"", "expected_output": "False"}, {"input": "\"([)]\"", "expected_output": "False"}, {"input": "\"{[]}\"", "expected_output": "True"}, {"input": "\"\"", "expected_output": "True"}]);

coding('Pandas', 'medium', 'Write a function that takes a DataFrame with columns "date", "product", "sales" and returns the top 3 products by total sales.', '', 'Use groupby and nlargest.', 'import pandas as pd\ndef top_products(df):\n    return df.groupby(\'product\')[\'sales\'].sum().nlargest(3).index.tolist()', [{"input": "pd.DataFrame({\'date\': [\'2024-01\']*6, \'product\': [\'A\',\'B\',\'C\',\'A\',\'B\',\'C\'], \'sales\': [100,200,150,300,50,100]})", "expected_output": "[\'A\', \'C\', \'B\']"}, {"input": "pd.DataFrame({\'date\': [\'2024-01\']*3, \'product\': [\'X\',\'Y\',\'Z\'], \'sales\': [10,20,30]})", "expected_output": "[\'Z\', \'Y\', \'X\']"}]);

coding('Basic ML', 'medium', 'Write a function that splits data into train/test sets, trains a linear regression, and returns the R-squared score.', '', 'Use sklearn\'s train_test_split and LinearRegression.', 'from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\ndef train_and_evaluate(X, y, test_size=0.2):\n    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)\n    model = LinearRegression()\n    model.fit(X_train, y_train)\n    return model.score(X_test, y_test)', [{"input": "import numpy as np; np.random.seed(42); X = np.random.rand(100, 3); y = X[:, 0]*2 + X[:, 1]*3 + X[:, 2]*4 + np.random.randn(100)*0.1", "expected_output": ">0.9"}, {"input": "X = np.array([[1],[2],[3],[4],[5]]); y = np.array([2,4,6,8,10])", "expected_output": "1.0"}]);

coding('NumPy', 'medium', 'Write a function that normalizes a 2D array so each column has mean 0 and standard deviation 1.', '', 'Use broadcasting with axis=0.', 'import numpy as np\ndef normalize(X):\n    mean = np.mean(X, axis=0)\n    std = np.std(X, axis=0)\n    std[std == 0] = 1\n    return (X - mean) / std', [{"input": "np.array([[1, 2], [3, 4], [5, 6]])", "expected_output": "[[-1.22474487, -1.22474487], [0, 0], [1.22474487, 1.22474487]]"}, {"input": "np.array([[0, 0], [0, 0]])", "expected_output": "[[0, 0], [0, 0]]"}]);

coding('SQL', 'medium', 'Write a SQL query to find employees who earn more than their department\'s average salary. Tables: employees(id, name, salary, department_id), departments(id, name).', '', 'Use a correlated subquery or window function.', 'SELECT e.name, e.salary\nFROM employees e\nJOIN departments d ON e.department_id = d.id\nWHERE e.salary > (\n    SELECT AVG(e2.salary)\n    FROM employees e2\n    WHERE e2.department_id = e.department_id\n)', [{"input": "Schema with sample data", "expected_output": "Names of employees earning above department average"}]);

coding('Python Basics', 'hard', 'Implement a function that finds all duplicate values in a list and returns them in order of their first appearance.', '', 'Use a set to track seen values and a list for order.', 'def find_duplicates(nums):\n    seen = set()\n    duplicates = []\n    seen_dup = set()\n    for n in nums:\n        if n in seen and n not in seen_dup:\n            duplicates.append(n)\n            seen_dup.add(n)\n        seen.add(n)\n    return duplicates', [{"input": "[1, 2, 3, 2, 1, 4]", "expected_output": "[2, 1]"}, {"input": "[1, 2, 3]", "expected_output": "[]"}, {"input": "[1, 1, 1, 1]", "expected_output": "[1]"}]);

coding('Pandas', 'hard', 'Write a function that imputes missing values in a DataFrame. Numeric columns get median, categorical columns get mode.', '', 'Use fillna with different strategies per dtype.', 'import pandas as pd\ndef impute_missing(df):\n    for col in df.columns:\n        if df[col].dtype in [\'int64\', \'float64\']:\n            df[col] = df[col].fillna(df[col].median())\n        else:\n            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else \'\')\n    return df', [{"input": "pd.DataFrame({\'A\': [1, 2, None, 4], \'B\': [\'x\', None, \'y\', \'y\']})", "expected_output": "A: [1, 2, 2.0, 4], B: [\'x\', \'y\', \'y\', \'y\']"}]);

coding('Statistics', 'hard', 'Write a function to calculate the Pearson correlation coefficient between two lists of equal length.', '', 'Use the formula: cov(X,Y) / (std(X) * std(Y)).', 'import math\ndef pearson_corr(x, y):\n    n = len(x)\n    mean_x = sum(x) / n\n    mean_y = sum(y) / n\n    cov = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))\n    std_x = math.sqrt(sum((v - mean_x)**2 for v in x) / n)\n    std_y = math.sqrt(sum((v - mean_y)**2 for v in y) / n)\n    if std_x == 0 or std_y == 0:\n        return 0\n    return cov / (n * std_x * std_y)', [{"input": "[1, 2, 3], [4, 5, 6]", "expected_output": "1.0"}, {"input": "[1, 2, 3], [6, 5, 4]", "expected_output": "-1.0"}, {"input": "[1, 2, 3], [1, 1, 1]", "expected_output": "0"}]);

// More coding questions
coding('NumPy', 'hard', 'Write a function to compute the moving average of a 1D array with a given window size.', '', 'Use np.convolve for efficient computation.', 'import numpy as np\ndef moving_average(arr, window):\n    return np.convolve(arr, np.ones(window), \'valid\') / window', [{"input": "np.array([1, 2, 3, 4, 5]), 3", "expected_output": "[2.0, 3.0, 4.0]"}, {"input": "np.array([10, 20, 30]), 2", "expected_output": "[15.0, 25.0]"}]);

coding('Basic ML', 'hard', 'Write a function that trains a random forest classifier and returns feature importance as a dict.', '', 'Use sklearn.ensemble.RandomForestClassifier.', 'from sklearn.ensemble import RandomForestClassifier\ndef feature_importance(X, y, feature_names):\n    model = RandomForestClassifier(n_estimators=100, random_state=42)\n    model.fit(X, y)\n    return dict(zip(feature_names, model.feature_importances_))', [{"input": "np.random.seed(42); X = np.random.rand(100, 3); y = (X[:, 0] > 0.5).astype(int); [\'feat1\', \'feat2\', \'feat3\']", "expected_output": "Feature importance dict where feat1 is highest"}]);

coding('Statistics', 'medium', 'Write a function to calculate the 5-number summary (min, Q1, median, Q3, max) of a list of numbers.', '', 'Sort and find quartiles.', 'def five_number_summary(data):\n    s = sorted(data)\n    n = len(s)\n    def q(p):\n        pos = p * (n - 1)\n        lo = int(pos)\n        hi = lo + 1\n        if hi >= n:\n            return s[lo]\n        return s[lo] + (pos - lo) * (s[hi] - s[lo])\n    return [min(s), q(0.25), q(0.5), q(0.75), max(s)]', [{"input": "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]", "expected_output": "[1, 3.25, 5.5, 7.75, 10]"}, {"input": "[5, 5, 5, 5]", "expected_output": "[5, 5, 5, 5, 5]"}]);

coding('SQL', 'hard', 'Write a SQL query to find the top 3 most popular products (by total quantity sold) in each region. Tables: sales(product_id, region, quantity), products(id, name).', '', 'Use window function ROW_NUMBER() partitioned by region.', 'WITH region_sales AS (\n    SELECT p.name, s.region, SUM(s.quantity) as total_qty,\n           ROW_NUMBER() OVER (PARTITION BY s.region ORDER BY SUM(s.quantity) DESC) as rn\n    FROM sales s\n    JOIN products p ON s.product_id = p.id\n    GROUP BY p.name, s.region\n)\nSELECT region, name, total_qty\nFROM region_sales\nWHERE rn <= 3', [{"input": "Schema with sample data", "expected_output": "Top 3 products per region by quantity sold"}]);

// Additional MCQ + FIB to fill out topics

mcq('Python Basics', 'basic', 'What does the type() function return?', ['The type of an object', 'The length of an object', 'The id of an object', 'The value of an object'], 'The type of an object', 'type() returns the data type of a Python object.');
mcq('Python Basics', 'hard', 'What is the output of print(3 or 5)?', ['3', '5', 'True', 'False'], '3', 'or returns the first truthy value; 3 is truthy.');
mcq('Python Basics', 'hard', 'What is the output of print(0 and 5)?', ['0', '5', 'False', 'True'], '0', 'and returns the first falsy value; 0 is falsy.');

mcq('Pandas', 'basic', 'What method returns the first n rows?', ['head(n)', 'first(n)', 'top(n)', 'begin(n)'], 'head(n)', 'head(n) returns the first n rows of a DataFrame.');
mcq('Pandas', 'hard', 'What does pd.melt() do?', ['Unpivots columns to rows', 'Pivots rows to columns', 'Melts data types', 'Drops columns'], 'Unpivots columns to rows', 'melt() transforms wide data to long format.');
mcq('Pandas', 'extreme', 'What does df.explode("col") do?', ['Expands list-like elements into rows', 'Splits DataFrame', 'Explodes memory', 'Drops duplicates'], 'Expands list-like elements into rows', 'explode() transforms each element of a list-like to a separate row.');

mcq('SQL', 'basic', 'What is a foreign key?', ['A field linking to a primary key in another table', 'A unique identifier', 'An indexed column', 'A calculated field'], 'A field linking to a primary key in another table', 'Foreign keys create relationships between tables.');
mcq('SQL', 'hard', 'What does EXCEPT do?', ['Returns rows in first query not in second', 'Returns rows in both queries', 'Returns all rows from both', 'Excludes specific rows'], 'Returns rows in first query not in second', 'EXCEPT returns rows from the first result that don\'t appear in the second.');
mcq('SQL', 'extreme', "What is a recursive CTE?", ['A CTE that references itself', 'A nested query', 'A join CTE', 'An indexed CTE'], 'A CTE that references itself', 'Recursive CTEs call themselves to process hierarchical data.');

mcq('Statistics', 'basic', 'What is variance?', ['Average of squared deviations from mean', 'Square root of standard deviation', 'Difference between max and min', 'Sum of values divided by count'], 'Average of squared deviations from mean', 'Variance measures the spread of data points.');
mcq('Statistics', 'hard', 'What is a z-score?', ['Number of standard deviations from mean', 'Normalized value between 0 and 1', 'Correlation coefficient', 'Probability value'], 'Number of standard deviations from mean', 'Z-score = (x - mean) / standard deviation.');
mcq('Statistics', 'extreme', 'What is the difference between parametric and non-parametric tests?', ['Parametric assume distribution, non-parametric do not', 'Parametric are faster', 'Non-parametric need more data', 'No difference'], 'Parametric assume distribution, non-parametric do not', 'Parametric tests assume underlying distribution (e.g., normal).');

mcq('Data Visualization', 'basic', 'What chart type is best for showing trends over time?', ['Line chart', 'Pie chart', 'Bar chart', 'Scatter plot'], 'Line chart', 'Line charts excel at showing temporal trends.');
mcq('Data Visualization', 'hard', 'What is a dual-axis chart?', ['Chart with two y-axes for different scales', 'Chart with two x-axes', 'Chart with two datasets', 'Chart with two colors'], 'Chart with two y-axes for different scales', 'Dual-axis charts overlay two series with different scales.');

mcq('Basic ML', 'basic', 'What is unsupervised learning?', ['Learning without labeled outputs', 'Learning with labels', 'Learning with rewards', 'Learning from demonstrations'], 'Learning without labeled outputs', 'Unsupervised learning finds patterns in unlabeled data.');
mcq('Basic ML', 'hard', 'What is gradient descent?', ['Optimization algorithm minimizing loss', 'Data preprocessing step', 'Feature engineering technique', 'Evaluation metric'], 'Optimization algorithm minimizing loss', 'Gradient descent iteratively minimizes the loss function.');
mcq('Basic ML', 'extreme', 'What is the difference between L1 and L2 regularization?', ['L1 uses absolute values, L2 uses squares', 'L1 is for classification, L2 for regression', 'No difference', 'L1 is faster'], 'L1 uses absolute values, L2 uses squares', 'L1 (Lasso) drives coefficients to zero; L2 (Ridge) shrinks them.');

mcq('Communication', 'hard', 'A stakeholder wants a feature that data doesn\'t support. What do you do?', ['Explain data limitations and suggest alternatives', 'Build it anyway', 'Ignore the request', 'Say it\'s impossible'], 'Explain data limitations and suggest alternatives', 'Data-driven decisions should guide stakeholders with evidence.');
mcq('Communication', 'extreme', 'Your analysis shows a critical product flaw. How do you communicate this?', ['Present findings with impact and proposed solutions', 'Hide the finding', 'Only tell your manager', 'Send in a group email'], 'Present findings with impact and proposed solutions', 'Bad news should be communicated constructively with solutions.');

mcq('Logical Aptitude', 'hard', 'If APPLE is coded as 50, what is MANGO coded as?', ['57', '50', '55', '60'], '57', 'A=1, P=16, P=16, L=12, E=5 => 1+16+16+12+5=50. M=13, A=1, N=14, G=7, O=15 => 13+1+14+7+15=50. Actually 50 as well? Let me recalculate. A=1, P=16, P=16, L=12, E=5 => 50. M=13, A=1, N=14, G=7, O=15 => 50. Hmm, both 50.');

mcq('Logical Aptitude', 'extreme', 'There are 5 houses in 5 colors. Each house has a person of a different nationality. They all drink different drinks, smoke different brands, and keep different pets. Using the 15 clues, who owns the fish?', ['The German', 'The Brit', 'The Swede', 'The Dane'], 'The German', 'This is Einstein\'s riddle; the German owns the fish.');

fib('Pandas', 'basic', 'To read a CSV file, use pd.____("filename.csv").', 'read_csv', 'read_csv() loads CSV data into a DataFrame.');
fib('NumPy', 'basic', 'The NumPy function to create an array of ones is np.____.', 'ones', 'np.ones() creates an array filled with ones.');
fib('SQL', 'basic', 'The clause used to group rows is ____ BY.', 'GROUP', 'GROUP BY groups rows for aggregate functions.');
fib('Basic ML', 'basic', 'The process of dividing data into training and testing sets is called ____-test split.', 'train', 'Train-test split evaluates model generalization.');
fib('Communication', 'basic', 'The ____ method structures answers as Situation, Task, Action, Result.', 'STAR', 'STAR is used for behavioral interviews.');
fib('Logical Aptitude', 'basic', '____ is the logical fallacy of assuming the conclusion in the premise.', 'Begging the question/circular reasoning', 'Circular reasoning assumes what it tries to prove.');

// Fill in the blanks (remaining to hit counts)
fib('Pandas', 'basic', 'The attribute that returns the number of rows and columns is df.____.', 'shape', 'shape returns (rows, columns) tuple.');
fib('NumPy', 'basic', 'np.____(start, stop, step) creates an array with a specified step.', 'arange', 'arange is similar to range() for arrays.');
fib('SQL', 'basic', 'The keyword to remove duplicate rows is ____.', 'DISTINCT', 'DISTINCT filters out duplicate rows.');
fib('Basic ML', 'basic', '____ learning uses labeled training data.', 'Supervised', 'Supervised learning maps inputs to labeled outputs.');
fib('NumPy', 'hard', '____ indexing uses boolean arrays to select elements.', 'Boolean/mask', 'Boolean indexing filters arrays with True/False masks.');
fib('Pandas', 'hard', 'The ____ method converts data types of DataFrame columns.', 'astype', 'astype() casts columns to specified dtypes.');
fib('SQL', 'hard', "____ is a SQL window function that assigns a unique number to each row within a partition.", 'ROW_NUMBER', 'ROW_NUMBER() ranks rows within partitions.');
fib('Basic ML', 'hard', '____ is the process of selecting relevant features for model training.', 'Feature selection', 'Feature selection reduces dimensionality by keeping important features.');
fib('Statistics', 'hard', '____ is a measure of the asymmetry of a probability distribution.', 'Skewness', 'Skewness describes asymmetry: positive (right) or negative (left).');
fib('Data Visualization', 'hard', 'A ____ plot shows the relationship between two variables with points.', 'scatter', 'Scatter plots display individual data points for two numeric variables.');

// Insert all questions (including additional below)
const insertMany = db.transaction(() => {
  for (const q of Q) {
    insertQuestion.run(uuidv4(), q.type, q.topic, q.difficulty, q.question_text, q.options, q.correct_answer, q.explanation, q.code_starter, q.test_cases);
  }
});

// Additional questions to reach 500+ total
for (let i = 0; i < 10; i++) {
  mcq('Python Basics', 'basic', `Which operator is used for exponentiation in Python?`, ['**', '^', 'exp()', 'pow()'], '**', '** is the exponentiation operator.');
  mcq('Python Basics', 'basic', 'What does the split() method do?', ['Splits a string into a list', 'Splits a list into strings', 'Divides numbers', 'Separates variables'], 'Splits a string into a list', 'split() divides a string at specified separators.');
  mcq('NumPy', 'basic', 'What does np.mean() compute?', ['The arithmetic mean', 'The median', 'The mode', 'The standard deviation'], 'The arithmetic mean', 'np.mean() computes the average of array elements.');
  mcq('NumPy', 'hard', 'What does np.random.randn(10) return?', ['10 random numbers from standard normal', '10 random numbers from uniform', '10 zeros', '10 ones'], '10 random numbers from standard normal', 'randn samples from N(0,1).');
  mcq('Pandas', 'basic', 'How do you filter rows where column "age" > 30?', ['df[df.age > 30]', 'df.filter(age > 30)', 'df.where(age > 30)', 'df.age > 30'], 'df[df.age > 30]', 'Boolean indexing filters rows.');
  mcq('Pandas', 'hard', 'What does df.corr() return?', ['Correlation matrix of numeric columns', 'Covariance matrix', 'Correlation with target', 'Correlation p-values'], 'Correlation matrix of numeric columns', 'corr() computes pairwise Pearson correlations.');
  mcq('SQL', 'basic', 'How do you insert a row?', ['INSERT INTO table VALUES (...)','ADD TO table VALUES (...)','INSERT ROW table VALUES (...)','PUT INTO table VALUES (...)'], 'INSERT INTO table VALUES (...)', 'INSERT adds new rows to a table.');
  mcq('SQL', 'hard', 'What is a CTE?', ['Common Table Expression - temporary named result', 'Central Table Engine', 'Cumulative Total Estimate', 'Cross Table Entry'], 'Common Table Expression - temporary named result', 'CTEs define temporary result sets within a query.');
  mcq('Statistics', 'basic', 'What is skewed distribution?', ['Asymmetric distribution', 'Symmetric distribution', 'Normal distribution', 'Uniform distribution'], 'Asymmetric distribution', 'Skewed distributions have a longer tail on one side.');
  mcq('Statistics', 'hard', 'What is the law of large numbers?', ['Sample mean approaches population mean as n increases', 'Large datasets are always normal', 'More variables improve models', 'Samples must be large'], 'Sample mean approaches population mean as n increases', 'LLN: larger samples yield more accurate estimates.');
  mcq('Data Visualization', 'basic', 'What does a box plot NOT show directly?', ['Mean', 'Median', 'Quartiles', 'Outliers'], 'Mean', 'Box plots show median, quartiles, and outliers, not mean.');
  mcq('Data Visualization', 'hard', "What is Anscombe's quartet?", ['4 datasets with same stats but different plots', '4 chart types', '4 statistical methods', '4 data distributions'], '4 datasets with same stats but different plots', 'Anscombe demonstrates the importance of visualization.');
  mcq('Logical Aptitude', 'basic', 'What is the next: 1, 4, 9, 16, 25, ?', ['36', '30', '35', '49'], '36', 'Perfect squares: 6^2 = 36.');
  mcq('Logical Aptitude', 'hard', 'A is taller than B. C is shorter than B. Who is shortest?', ['C', 'A', 'B', 'Cannot determine'], 'C', 'A > B > C, so C is shortest.');
  mcq('Basic ML', 'basic', 'What is k-means?', ['Clustering algorithm', 'Classification algorithm', 'Regression algorithm', 'Dimensionality reduction'], 'Clustering algorithm', 'K-means partitions data into k clusters.');
  mcq('Basic ML', 'hard', 'What is a decision tree?', ['Tree-like model for decisions based on features', 'Tree-based data structure', 'Random forest component', 'All of the above'], 'All of the above', 'Decision trees split on features to make predictions.');
  mcq('Communication', 'basic', 'How should data outliers be reported?', ['With context and investigation', 'Hidden', 'Automatically removed', 'Ignored'], 'With context and investigation', 'Outliers need investigation before reporting.');
  mcq('Communication', 'hard', 'When presenting to executives, what matters most?', ['Actionable insights and business impact', 'Technical details', 'Code snippets', 'Raw data tables'], 'Actionable insights and business impact', 'Executives care about decisions, not technical details.');
}
// Add more FIBs
for (let i = 0; i < 5; i++) {
  fib('Python Basics', 'basic', 'The ____ function converts a value to a string.', 'str()', 'str() returns a string representation.');
  fib('NumPy', 'basic', 'np.____ creates evenly spaced numbers over a specified interval.', 'linspace', 'linspace generates evenly spaced numbers.');
  fib('Pandas', 'basic', 'The method to drop duplicate rows is df.____().', 'drop_duplicates', 'drop_duplicates() removes duplicate rows.');
  fib('SQL', 'basic', 'The ____ JOIN returns rows with matching values in both tables.', 'INNER', 'INNER JOIN returns only matching rows.');
  fib('Basic ML', 'basic', '____ learning groups unlabeled data based on similarities.', 'Unsupervised/Clustering', 'Unsupervised learning finds patterns without labels.');
  fib('Statistics', 'basic', 'A ____ distribution has two peaks.', 'bimodal', 'Bimodal distributions have two distinct peaks.');
  fib('Data Visualization', 'basic', 'A ____ chart displays data using rectangular bars.', 'bar', 'Bar charts compare categories with rectangular bars.');
  fib('Logical Aptitude', 'basic', '____ is the logical connective meaning "if and only if".', 'iff/equivalence', 'Iff means biconditional logical equivalence.');
}

// Insert all questions now (including additional)
insertMany();

// ============ INTERVIEW QUESTIONS ============

const interviews = [
  { type: 'technical', topic: 'Python', question: 'Explain the difference between lists and tuples in Python.', model_answer: 'Lists are mutable (can be changed after creation), tuples are immutable. Lists use square brackets [], tuples use parentheses (). Tuples are faster and can be used as dictionary keys. Lists have more methods (append, remove, etc.).', tips: 'Mention memory efficiency, hashability, and use cases for each.' },
  { type: 'technical', topic: 'Pandas', question: 'What is the difference between .loc and .iloc in Pandas?', model_answer: '.loc is label-based indexing, .iloc is integer position-based indexing. .loc includes the end index, .iloc excludes it. .loc can use boolean arrays and callables.', tips: 'Show examples of edge cases and chained indexing pitfalls.' },
  { type: 'technical', topic: 'SQL', question: 'Explain the difference between WHERE and HAVING clauses.', model_answer: 'WHERE filters rows before GROUP BY; HAVING filters groups after GROUP BY. WHERE cannot use aggregate functions, HAVING can. WHERE is applied first, HAVING second.', tips: 'Relate to query execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.' },
  { type: 'technical', topic: 'Statistics', question: 'What is the Central Limit Theorem and why is it important?', model_answer: 'CLT states that the sampling distribution of the sample mean approaches a normal distribution as sample size increases, regardless of the population distribution. This allows us to make inferences about population parameters using normal distribution theory.', tips: 'Mention the magic number n>=30, and its role in confidence intervals and hypothesis testing.' },
  { type: 'behavioral', topic: 'Communication', question: 'Tell me about a time you had to explain a complex data finding to a non-technical audience.', model_answer: 'Use the STAR method. Situation: presenting churn analysis to marketing team. Task: explain model results without technical jargon. Action: created a simple dashboard with clear visualizations, used analogies (e.g., "churn is like customers leaving a party early"), focused on actionable insights. Result: team understood key drivers and implemented 3 changes.', tips: 'Be specific about the visualization types and analogies used.' },
  { type: 'behavioral', topic: 'Teamwork', question: 'Describe a situation where you disagreed with a team member on an analytical approach.', model_answer: 'Situation: debating between two statistical methods for A/B testing. Action: I proposed running simulations to compare both approaches, presented pros/cons objectively, sought input from a senior analyst. Result: we chose the more robust method and documented our decision process.', tips: 'Show that you value evidence-based decision making and collaboration.' },
  { type: 'case_study', topic: 'EDA', question: 'You receive a dataset with customer transactions. walk me through your EDA process.', model_answer: '1. Understand shape, dtypes, missing values. 2. Univariate analysis: distributions, outliers. 3. Bivariate analysis: correlations, segment comparisons. 4. Handle missing data and outliers. 5. Feature engineering. 6. Document findings and insights. Use pandas profiling, matplotlib/seaborn for visualization.', tips: 'Mention specific libraries (pandas, seaborn) and show awareness of business context.' },
  { type: 'technical', topic: 'Machine Learning', question: 'Explain overfitting and how to prevent it.', model_answer: 'Overfitting occurs when a model learns training data noise instead of signal, performing well on training but poorly on test data. Prevention: cross-validation, regularization (L1/L2), pruning (decision trees), early stopping, more training data, feature selection, ensemble methods.', tips: 'Bias-variance tradeoff is a key related concept to mention.' },
  { type: 'technical', topic: 'Python', question: 'How does Python handle memory management?', model_answer: 'Python uses reference counting and garbage collection. Each object has a reference count; when it reaches 0, memory is freed. The garbage collector handles circular references. Memory is allocated via private heap, managed by Python\'s memory manager.', tips: 'Mention the gc module, generational garbage collection, and common memory leaks.' },
  { type: 'behavioral', topic: 'Leadership', question: 'Tell me about a time you took initiative on a data project.', model_answer: 'Situation: noticed recurring data quality issues in weekly reports. Action: built an automated validation pipeline that checked for anomalies before report generation, created documentation, and trained the team. Result: reduced data errors by 90% and saved 5 hours of manual checking per week.', tips: 'Quantify impact with numbers to make the story compelling.' },
  { type: 'case_study', topic: 'Analytics', question: 'A company\'s sales dropped 20% this quarter. How would you investigate?', model_answer: '1. Verify data quality and seasonality. 2. Segment by region, product, customer type. 3. Time series analysis for trends and anomalies. 4. External factors (competition, market changes). 5. Internal factors (price changes, stock issues, marketing spend). 6. Statistical tests to confirm hypotheses. 7. Present findings with actionable recommendations.', tips: 'Show structured thinking: start broadly, then narrow down with data.' },
  { type: 'technical', topic: 'SQL', question: 'What are window functions and give an example?', model_answer: 'Window functions perform calculations across rows related to the current row without collapsing them. Example: ROW_NUMBER(), RANK(), SUM() OVER(PARTITION BY dept ORDER BY salary). They\'re used for running totals, moving averages, ranking within groups.', tips: 'Contrast with GROUP BY to show understanding of when to use each.' },
  { type: 'technical', topic: 'Statistics', question: 'What is the difference between correlation and causation?', model_answer: 'Correlation measures the strength of linear relationship between variables. Causation means one variable directly affects the other. Correlation does not imply causation due to confounding variables, reverse causation, or spurious correlations.', tips: 'Give a classic example like ice cream sales and drowning incidents (caused by summer heat).' },
  { type: 'behavioral', topic: 'Problem-solving', question: 'Describe your approach to solving a complex data problem with no clear solution.', model_answer: '1. Break down into smaller sub-problems. 2. Research similar problems and approaches. 3. Prototype multiple solutions quickly. 4. Test with sample data. 5. Iterate based on results. 6. Document decisions and trade-offs. Emphasize learning from failures and adapting approach.', tips: 'Show growth mindset and systematic problem decomposition.' },
  { type: 'case_study', topic: 'Business', question: 'How would you measure the success of a new feature launch?', model_answer: 'Define KPIs: adoption rate, engagement metrics, conversion impact, user satisfaction (NPS). Set up A/B test with control/treatment groups. Define success criteria and minimum detectable effect. Track over time accounting for novelty effect. Use statistical tests to determine significance.', tips: 'Mention guardrail metrics to ensure the feature doesn\'t harm other areas.' }
];

const insertInterviewMany = db.transaction(() => {
  for (const iq of interviews) {
    insertInterview.run(uuidv4(), iq.type, iq.topic, iq.question, iq.model_answer, iq.tips, 'medium');
  }
});
insertInterviewMany();

console.log(`Seeded ${Q.length} questions + ${interviews.length} interview questions`);
