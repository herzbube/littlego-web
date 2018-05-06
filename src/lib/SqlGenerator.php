<?php
declare(strict_types = 1);

namespace LittleGoWeb {

    require_once(dirname(__FILE__) . "/constants.php");

    // The SqlGenerator class generates SQL language query fragments for the
    // MySQL DBMS.
    class SqlGenerator
    {
        private $databaseName = "";

        // Constructs a new SqlGenerator object.
        public function __construct(string $databaseName)
        {
            $this->databaseName = $databaseName;
        }

        // Generates a full query string (including the terminating ";") that
        // contains a SELECT statement including a WHERE clause.
        //
        // The first specified array lists the column names that should appear
        // in the SELECT part of the query.
        //
        // The second specified array lists the column names that should appear
        // in the WHERE part of the query.
        //
        // The resulting query string contains parameters that must be bound
        // to a prepared statement.
        public function getSelectStatementWithWhereClause(string $tableName, array $columnNames, array $whereColumnNames): string
        {
            $queryString = $this->getSelectStatement($tableName, $columnNames);
            $queryString .= " where ";
            $queryString .= $this->getWhereColumnsEqualValues($tableName, $whereColumnNames, SQL_OPERATOR_AND);
            $queryString .= ";";

            return $queryString;
        }

        // Generates a full query string (including the terminating ";") that
        // contains a SELECT statement including a WHERE clause.
        //
        // The SELECT statement performs a "COUNT(*)". The second parameter
        // specifies the alias name that should be used as the column name of
        // the count result.
        //
        // The specified array lists the column names that should appear
        // in the WHERE part of the query.
        //
        // The resulting query string contains parameters that must be bound
        // to a prepared statement.
        public function getSelectCountStatementWithWhereClause(string $tableName, string $aliasName, array $whereColumnNames) : string
        {
            $queryString = $this->getSelectCountStatement($tableName, $aliasName);
            $queryString .= " where ";
            $queryString .= $this->getWhereColumnsEqualValues($tableName, $whereColumnNames, SQL_OPERATOR_AND);
            $queryString .= ";";

            return $queryString;
        }

        // Generates a full query string (including the terminating ";") that
        // contains a SELECT statement including an ORDER BY clause.
        //
        // The first specified array lists the column names that should appear
        // in the SELECT part of the query.
        //
        // The second specified array lists the column names that should appear
        // in the ORDER BY part of the query.
        //
        // The third specified array lists how each ORDER BY column should be
        // ordered. The array must have the same number of elements as the
        // second array. A true value orders the column ascending, a false
        // value orders the column descending.
        public function getSelectStatementWithOrderByClause(string $tableName, array $columnNames, array $orderByColumnNames, array $orderings): string
        {
            $queryString = $this->getSelectStatement($tableName, $columnNames);
            $queryString .= " order by ";
            $queryString .= $this->getColumnsWithOrderings($tableName, $orderByColumnNames, $orderings);
            $queryString .= ";";

            return $queryString;
        }

        // Generates a full query string (including the terminating ";") that
        // contains a SELECT statement including a WHERE and an ORDER BY
        // clause.
        //
        // The first specified array lists the column names that should appear
        // in the SELECT part of the query.
        //
        // The second specified array lists the column names that should appear
        // in the WHERE part of the query.
        //
        // The third specified array lists the column names that should appear
        // in the ORDER BY part of the query.
        //
        // The fourth specified array lists how each ORDER BY column should be
        // ordered. The array must have the same number of elements as the
        // third array. A true value orders the column ascending, a false
        // value orders the column descending.
        //
        // The resulting query string contains parameters that must be bound
        // to a prepared statement.
        public function getSelectStatementWithOrderByAndWhereClause(string $tableName, array $columnNames, array $whereColumnNames, array $orderByColumnNames, array $orderings): string
        {
            $queryString = $this->getSelectStatement($tableName, $columnNames);
            $queryString .= " where ";
            $queryString .= $this->getWhereColumnsEqualValues($tableName, $whereColumnNames, SQL_OPERATOR_AND);
            $queryString .= " order by ";
            $queryString .= $this->getColumnsWithOrderings($tableName, $orderByColumnNames, $orderings);
            $queryString .= ";";

            return $queryString;
        }

        // Generates a full query string (including the terminating ";") that
        // contains a SELECT statement including an ORDER BY and a LIMIT
        // clause.
        //
        // The first specified array lists the column names that should appear
        // in the SELECT part of the query.
        //
        // The second specified array lists the column names that should appear
        // in the ORDER BY part of the query.
        //
        // The third specified array lists how each ORDER BY column should be
        // ordered. The array must have the same number of elements as the
        // second array. A true value orders the column ascending, a false
        // value orders the column descending.
        //
        // The fourth parameter value specifies the value to use for the LIMIT
        // clause.
        public function getSelectStatementWithOrderByAndLimitClause(string $tableName, array $columnNames, array $orderByColumnNames, array $orderings, int $limit): string
        {
            $queryString = $this->getSelectStatement($tableName, $columnNames);
            $queryString .= " order by ";
            $queryString .= $this->getColumnsWithOrderings($tableName, $orderByColumnNames, $orderings);
            $queryString .= " limit ";
            $queryString .= $limit;
            $queryString .= ";";

            return $queryString;
        }

        // Generates a full query string (including the terminating ";") that
        // contains a SELECT statement including a WHERE, an ORDER BY and a
        // LIMIT clause.
        //
        // The first specified array lists the column names that should appear
        // in the SELECT part of the query.
        //
        // The second specified array lists the column names that should appear
        // in the WHERE part of the query.
        //
        // The third specified array lists the column names that should appear
        // in the ORDER BY part of the query.
        //
        // The fourth specified array lists how each ORDER BY column should be
        // ordered. The array must have the same number of elements as the
        // third array. A true value orders the column ascending, a false
        // value orders the column descending.
        //
        // The fifth parameter value specifies the value to use for the LIMIT
        // clause.
        public function getSelectStatementWithOrderByAndWhereAndLimitClause(string $tableName, array $columnNames, array $whereColumnNames, array $orderByColumnNames, array $orderings, int $limit): string
        {
            $queryString = $this->getSelectStatement($tableName, $columnNames);
            $queryString .= " where ";
            $queryString .= $this->getWhereColumnsEqualValues($tableName, $whereColumnNames, SQL_OPERATOR_AND);
            $queryString .= " order by ";
            $queryString .= $this->getColumnsWithOrderings($tableName, $orderByColumnNames, $orderings);
            $queryString .= " limit ";
            $queryString .= $limit;
            $queryString .= ";";

            return $queryString;
        }

        // Generates a query fragment that contains a SELECT statement without
        // a WHERE or any other clauses.
        //
        // The specified array lists the column names that should appear in
        // the query fragment.
        public function getSelectStatement(string $tableName, array $columnNames): string
        {
            $queryFragment = "select ";
            $queryFragment .= $this->getColumnNames($tableName, $columnNames);
            $queryFragment .= " from ";
            $queryFragment .= $this->getFullyQualifiedTableName($tableName);

            return $queryFragment;
        }

        // Generates a query fragment that contains a SELECT statement without
        // a WHERE or any other clauses.
        //
        // The SELECT statement performs a "COUNT(*)". The second parameter
        // specifies the alias name that should be used as the column name of
        // the count result.
        public function getSelectCountStatement(string $tableName, string $aliasName): string
        {
            $queryFragment = "select ";
            $queryFragment .= " count(*) as $aliasName";
            $queryFragment .= " from ";
            $queryFragment .= $this->getFullyQualifiedTableName($tableName);

            return $queryFragment;
        }

        // Generates a full query string (including the terminating ";") that
        // contains an UPDATE statement including a WHERE clause.
        //
        // The first specified array lists the column names that should appear
        // in the UPDATE part of the query.
        //
        // The second specified array lists the column names that should appear
        // in the WHERE part of the query.
        //
        // The resulting query string contains parameters that must be bound to
        // a prepared statement.
        public function getUpdateStatementWithWhereClause(string $tableName, array $columnNames, array $whereColumnNames): string
        {
            $queryString = $this->getUpdateStatement($tableName, $columnNames);
            $queryString .= " where ";
            $queryString .= $this->getWhereColumnsEqualValues($tableName, $whereColumnNames, SQL_OPERATOR_AND);
            $queryString .= ";";

            return $queryString;
        }

        // Generates a query fragment that contains an UPDATE statement without
        // a WHERE clause.
        //
        // The specified array lists the column names that should appear in the
        // query fragment.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getUpdateStatement(string $tableName, array $columnNames): string
        {
            $queryFragment = "update ";
            $queryFragment .= $this->getFullyQualifiedTableName($tableName);
            $queryFragment .= " set ";
            $queryFragment .= $this->getUpdateColumnsWithValues($tableName, $columnNames);

            return $queryFragment;
        }

        // Generates a full query string (including the terminating ";") that
        // contains an INSERT statement.
        //
        // The specified array lists the column names that should appear in the
        // query.
        //
        // The resulting query string contains parameters that must be bound to
        // a prepared statement.
        public function getInsertStatement(string $tableName, array $columnNames): string
        {
            $queryString = "insert into ";
            $queryString .= $this->getFullyQualifiedTableName($tableName);
            $queryString .= SQL_OPERATOR_PARANTHESIS_OPEN;
            $queryString .= $this->getColumnNames($tableName, $columnNames);
            $queryString .= SQL_OPERATOR_PARANTHESIS_CLOSE;
            $queryString .= " values ";
            $queryString .= SQL_OPERATOR_PARANTHESIS_OPEN;
            $queryString .= $this->getValues($tableName, $columnNames);
            $queryString .= SQL_OPERATOR_PARANTHESIS_CLOSE;
            $queryString .= ";";

            return $queryString;
        }

        // Generates a full query string (including the terminating ";") that
        // contains a DELETE statement including a WHERE clause.
        //
        // The specified array lists the column names that should appear
        // in the WHERE part of the query.
        //
        // The resulting query string contains parameters that must be bound to
        // a prepared statement.
        public function getDeleteStatementWithWhereClause(string $tableName, array $whereColumnNames): string
        {
            $queryString = $this->getDeleteStatement($tableName);
            $queryString .= " where ";
            $queryString .= $this->getWhereColumnsEqualValues($tableName, $whereColumnNames, SQL_OPERATOR_AND);
            $queryString .= ";";

            return $queryString;
        }

        // Generates a query fragment that contains a DELETE statement without
        // a WHERE clause.
        public function getDeleteStatement(string $tableName): string
        {
            $queryFragment = "delete from ";
            $queryFragment .= $this->getFullyQualifiedTableName($tableName);

            return $queryFragment;
        }

        // Generates a query fragment that contains an INNER JOIN clause.
        // The resulting query fragment is suitable for appending to a
        // partial FROM clause.
        //
        // The JOIN is performed on a single column only, for which the
        // name must be specified. Both the left and right table must use
        // the same column name.
        public function getInnerJoinClause(
            string $tableNameLeft,
            string $tableNameRight,
            string $columnName): string
        {
            return $this->getJoinClause(
                SQL_JOINNAME_INNERJOIN,
                $tableNameLeft,
                $tableNameRight,
                $columnName);
        }

        // Generates a query fragment that contains a LEFT JOIN clause.
        // The resulting query fragment is suitable for appending to a
        // partial FROM clause.
        //
        // The JOIN is performed on a single column only, for which the
        // name must be specified. Both the left and right table must use
        // the same column name.
        public function getLeftJoinClause(
            string $tableNameLeft,
            string $tableNameRight,
            string $columnName): string
        {
            return $this->getJoinClause(
                SQL_JOINNAME_LEFTJOIN,
                $tableNameLeft,
                $tableNameRight,
                $columnName);
        }

        // Generates a query fragment that can be used anywhere where a
        // comma-separated list of column names is appropriate.
        //
        // The table name parameter is required to form unambiguous column
        // names, which might be required in a query that uses JOINs.
        //
        // The specified array lists the column names that should appear in the
        // query fragment.
        public function getColumnNames(string $tableName, array $columnNames): string
        {
            $queryFragment = "";
            foreach ($columnNames as $columnName)
            {
                $queryFragment .= SQL_OPERATOR_COMMA;
                $queryFragment .= $this->getFullyQualifiedColumnName($tableName, $columnName);
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen(SQL_OPERATOR_COMMA));

            return $queryFragment;
        }

        // Generates a query fragment that can be used anywhere where a
        // comma-separated list of values is appropriate.
        //
        // The table name parameter is required to form unambiguous column
        // names, which might be required in a query that uses JOINs.
        //
        // The specified array lists the column names for which the values
        // appear in the query fragment.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getValues(string $tableName, array $columnNames): string
        {
            $queryFragment = "";
            foreach ($columnNames as $columnName)
            {
                $queryFragment .= SQL_OPERATOR_COMMA;
                $queryFragment .= $this->getParameterNameForColumName($tableName, $columnName);
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen(SQL_OPERATOR_COMMA));

            return $queryFragment;
        }

        // Generates a query fragment that can be used in a WHERE clause. The
        // query fragment does not include the "WHERE" SQL keyword.
        //
        // The parameters specify the table and column name for which the
        // condition should be generated. The table name is required to form
        // an unambiguous column name (which might be required in a query
        // that uses JOINs).
        //
        // The resulting query fragment uses the "=" operator to compare the
        // column content with a value.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getWhereColumnEqualsValue(string $tableName, string $columnName): string
        {
            return $this->getColumnsEqualValues($tableName, array($columnName), SQL_OPERATOR_AND);
        }

        // Generates a query fragment that can be used in a WHERE clause. The
        // query fragment does not include the "WHERE" SQL keyword.
        //
        // The table name parameter is required to form unambiguous column
        // names, which might be required in a query that uses JOINs.
        //
        // The specified array lists the column names for which conditions
        // should be generated.
        //
        // The resulting query fragment uses the "=" operator to compare the
        // column content with a value, and the specified logical operator to
        // combine the individual conditions.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getWhereColumnsEqualValues(string $tableName, array $columnNames, string $logicalOperator): string
        {
            return $this->getColumnsEqualValues($tableName, $columnNames, $logicalOperator);
        }

        // Generates a query fragment that can be used in a WHERE clause. The
        // query fragment does not include the "WHERE" SQL keyword.
        //
        // The table name parameter is required to form an unambiguous column
        // name, which might be required in a query that uses JOINs.
        //
        // The parameter specifies the column name for which the condition
        // should be generated.
        //
        // The resulting query fragment uses the "<>" operator to compare the
        // column content with a value.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getWhereColumnNotEqualsValue(string $tableName, string $columnName): string
        {
            return $this->getColumnNotEqualsValue($tableName, $columnName);
        }

        // Generates a query fragment that can be used in a WHERE clause. The
        // query fragment does not include the "WHERE" SQL keyword.
        //
        // The table name parameter is required to form an unambiguous column
        // name, which might be required in a query that uses JOINs.
        //
        // The parameter specifies the column name for which the condition
        // should be generated.
        //
        // The resulting query fragment uses the "IS NULL" operator.
        public function getWhereColumnIsNull(string $tableName, string $columnName): string
        {
            $queryFragment = $this->getFullyQualifiedColumnName($tableName, $columnName);
            $queryFragment .= SQL_OPERATOR_ISNULL;

            return $queryFragment;
        }

        // Generates a query fragment that can be used in an UPDATE statement.
        // The query fragment does not include the "UPDATE" SQL keyword.
        //
        // The table name parameter is required to form unambiguous column
        // names, which might be required in a query that uses JOINs.
        //
        // The specified array lists the column names to be updated.
        //
        // The resulting query fragment uses the "=" operator to set the column
        // content with a value.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getUpdateColumnsWithValues(string $tableName, array $columnNames): string
        {
            return $this->getColumnsEqualValues($tableName, $columnNames, SQL_OPERATOR_COMMA);
        }

        // Generates a query fragment that contains a JOIN clause with the
        // specified name. The resulting query fragment is suitable for
        // appending to a partial FROM clause.
        //
        // The JOIN is performed on a single column only, for which the
        // name must be specified. Both the left and right table must use
        // the same column name.
        private function getJoinClause(
            string $joinName,
            string $tableNameLeft,
            string $tableNameRight,
            string $columnName): string
        {
            $queryString = $joinName;
            $queryString .= $this->getFullyQualifiedTableName($tableNameRight);
            $queryString .= SQL_OPERATOR_ON;
            $queryString .= $tableNameLeft . SQL_OBJECT_SEPARATOR . $columnName;
            $queryString .= SQL_OPERATOR_EQUALS;
            $queryString .= $tableNameRight . SQL_OBJECT_SEPARATOR . $columnName;

            return $queryString;
        }

        // Generates a query fragment that combines the specified column names
        // with corresponding parameter values using the "=" operator.
        //
        // The table name parameter is required to form unambiguous column
        // names, which might be required in a query that uses JOINs.
        //
        // The specified operator is used to separate the individual
        // "columnName = value" pairs. For instance, this could be the logical
        // operator "and" to combine multiple conditions in a WHERE clause.
        // But it could also be a comma (",") separator to create a list of
        // assignments in an UPDATE statement.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        private function getColumnsEqualValues(string $tableName, array $columnNames, string $operator): string
        {
            $queryFragment = "";
            foreach ($columnNames as $columnName)
            {
                $queryFragment .= $operator;
                $queryFragment .= $this->getColumnEqualsValue($tableName, $columnName);
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen($operator));

            return $queryFragment;
        }

        // Generates a query fragment that combines the specified column name
        // with a parameter value using the "=" operator.
        //
        // The table name parameter is required to form an unambiguous column
        // name, which might be required in a query that uses JOINs.
        //
        // This is private helper function.
        private function getColumnEqualsValue(string $tableName, string $columnName): string
        {
            return $this->getColumnComparisonWithValue($tableName, $columnName, SQL_OPERATOR_EQUALS);
        }

        // Generates a query fragment that combines the specified column name
        // with a parameter value using the "<>" operator.
        //
        // The table name parameter is required to form an unambiguous column
        // name, which might be required in a query that uses JOINs.
        //
        // This is private helper function.
        private function getColumnNotEqualsValue(string $tableName, string $columnName): string
        {
            return $this->getColumnComparisonWithValue($tableName, $columnName, SQL_OPERATOR_NOTEQUALS);
        }

        // Generates a query fragment that combines the specified column name
        // with a parameter value using the specified comparison operator.
        //
        // The table name parameter is required to form an unambiguous column
        // name, which might be required in a query that uses JOINs.
        //
        // This only works for operators that have a left-hand-side and a
        // right-hand-side operator.
        //
        // This is private helper function.
        private function getColumnComparisonWithValue(string $tableName, string $columnName, string $comparisonOperator): string
        {
            $queryFragment = $this->getFullyQualifiedColumnName($tableName, $columnName);
            $queryFragment .= $comparisonOperator;
            $queryFragment .= $this->getParameterNameForColumName($tableName, $columnName);

            return $queryFragment;
        }

        // Generates a query fragment that combines the specified column names
        // with "ASC" or "DESC" keywords. The result can be used in an
        // ORDER BY clause.
        //
        // The table name parameter is required to form unambiguous column
        // names, which might be required in a query that uses JOINs.
        //
        // The first specified array lists the column names, the second
        // specified array lists how each column should be ordered. The second
        // array must have the same number of elements as the first array. A
        // true value orders the column ascending, a false value orders the
        // column descending.
        //
        // This is private helper function.
        public function getColumnsWithOrderings(string $tableName, array $columnNames, array $orderings): string
        {
            $columnNamesWithOrderings = array_combine($columnNames, $orderings);

            $queryFragment = "";
            foreach ($columnNamesWithOrderings as $columnName => $ordering)
            {
                $queryFragment .= SQL_OPERATOR_COMMA;
                $queryFragment .= $this->getColumnWithOrdering($tableName, $columnName, $ordering);
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen(SQL_OPERATOR_COMMA));

            return $queryFragment;
        }

        // Generates a query fragment that combines the specified column name
        // with an "ASC" or "DESC" keyword. The result can be used in an
        // ORDER BY clause.
        //
        // The table name parameter is required to form an unambiguous column
        // name, which might be required in a query that uses JOINs.
        //
        // This is private helper function.
        public function getColumnWithOrdering(string $tableName, string $columnName, bool $ascending): string
        {
            $queryFragment = $this->getFullyQualifiedColumnName($tableName, $columnName);
            if ($ascending)
                $queryFragment .= SQL_OPERATOR_ASCENDING;
            else
                $queryFragment .= SQL_OPERATOR_DESCENDING;

            return $queryFragment;
        }

        // Returns the parameter name for the specified combination of
        // table name and column name.
        public function getParameterNameForColumName(string $tableName, string $columnName): string
        {
            // It's not strictly necessary that we use a separator, but
            // it makes the query string more human readable when debugging
            // queries.
            return PREPARED_STATEMENT_PARAMETER_PREFIX . $tableName . PREPARED_STATEMENT_PARAMETER_SEPARATOR . $columnName;
        }

        // Returns a fully qualified table name for the specified unqualified
        // table name. The result is unambiguous within the database that was
        // specified in the SqlGenerator constructor.
        private function getFullyQualifiedTableName(string $unqualifiedTableName)
        {
            return SQL_QUOTE_CHARACTER . $this->databaseName . SQL_QUOTE_CHARACTER . SQL_OBJECT_SEPARATOR . $unqualifiedTableName;
        }

        // Returns a fully qualified column name for the specified unqualified
        // column name. The result is unambiguous as long as the specified
        // table name is unique in a query. The specified table name can be an
        // alias.
        private function getFullyQualifiedColumnName(string $tableName, $unqualifiedColumnName)
        {
            return $tableName . SQL_OBJECT_SEPARATOR . $unqualifiedColumnName;
        }
    }
}
