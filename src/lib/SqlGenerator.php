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
            $queryString .= $this->getWhereColumnsEqualValues($whereColumnNames);
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
            $queryString .= $this->getColumnsWithOrderings($orderByColumnNames, $orderings);
            $queryString .= " limit ";
            $queryString .= $limit;
            $queryString .= ";";

            return $queryString;
        }

        // Generates a query fragment that contains a SELECT statement without
        // a WHERE clause.
        //
        // The specified array lists the column names that should appear in
        // the query fragment.
        public function getSelectStatement(string $tableName, array $columnNames): string
        {
            $queryFragment = "select ";
            $queryFragment .= $this->getColumnNames($columnNames);
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
            $queryString .= $this->getWhereColumnsEqualValues($whereColumnNames);
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
            $queryFragment .= $this->getUpdateColumnsWithValues($columnNames);

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
            $queryString .= $this->getColumnNames($columnNames);
            $queryString .= SQL_OPERATOR_PARANTHESIS_CLOSE;
            $queryString .= " values ";
            $queryString .= SQL_OPERATOR_PARANTHESIS_OPEN;
            $queryString .= $this->getValues($columnNames);
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
            $queryString .= $this->getWhereColumnsEqualValues($whereColumnNames);
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

        // Generates a query fragment that can be used anywhere where a
        // comma-separated list of column names is appropriate.
        //
        // The specified array lists the column names that should appear in the
        // query fragment.
        public function getColumnNames(array $columnNames): string
        {
            $queryFragment = "";
            foreach ($columnNames as $columnName)
            {
                $queryFragment .= SQL_OPERATOR_COMMA;
                $queryFragment .= $columnName;
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen(SQL_OPERATOR_COMMA));

            return $queryFragment;
        }

        // Generates a query fragment that can be used anywhere where a
        // comma-separated list of values is appropriate.
        //
        // The specified array lists the column names for which the values
        // appear in the query fragment.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getValues(array $columnNames): string
        {
            $queryFragment = "";
            foreach ($columnNames as $columnName)
            {
                $queryFragment .= SQL_OPERATOR_COMMA;
                $queryFragment .= $this->getParameterNameForColumName($columnName);
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen(SQL_OPERATOR_COMMA));

            return $queryFragment;
        }

        // Generates a query fragment that can be used in a WHERE clause. The
        // query fragment does not include the "WHERE" SQL keyword.
        //
        // The parameter specifies the column name for which the condition
        // should be generated.
        //
        // The resulting query fragment uses the "=" operator to compare the
        // column content with a value.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getWhereColumnEqualsValue(string $columnName): string
        {
            return $this->getColumnsEqualValues(array($columnName), SQL_OPERATOR_AND);
        }

        // Generates a query fragment that can be used in a WHERE clause. The
        // query fragment does not include the "WHERE" SQL keyword.
        //
        // The specified array lists the column names for which conditions
        // should be generated.
        //
        // The resulting query fragment uses the "=" operator to compare the
        // column content with a value, and the "AND" operator to combine the
        // individual conditions.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getWhereColumnsEqualValues(array $columnNames): string
        {
            return $this->getColumnsEqualValues($columnNames, SQL_OPERATOR_AND);
        }

        // Generates a query fragment that can be used in an UPDATE statement.
        // The query fragment does not include the "UPDATE" SQL keyword.
        //
        // The specified array lists the column names to be updated.
        //
        // The resulting query fragment uses the "=" operator to set the column
        // content with a value.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        public function getUpdateColumnsWithValues(array $columnNames): string
        {
            return $this->getColumnsEqualValues($columnNames, SQL_OPERATOR_COMMA);
        }

        // Generates a query fragment that combines the specified column names
        // with corresponding parameter values using the "=" operator.
        //
        // The specified operator is used to separate the individual
        // "columnName = value" pairs.
        //
        // The resulting query fragment contains parameters that must be bound
        // to a prepared statement.
        private function getColumnsEqualValues(array $columnNames, string $operator): string
        {
            $queryFragment = "";
            foreach ($columnNames as $columnName)
            {
                $queryFragment .= $operator;
                $queryFragment .= $this->getColumnEqualsValue($columnName);
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen($operator));

            return $queryFragment;
        }

        // Generates a query fragment that combines the specified column name
        // with a parameter value using the "=" operator.
        //
        // This is private helper function.
        private function getColumnEqualsValue(string $columnName): string
        {
            $queryFragment = $columnName;
            $queryFragment .= SQL_OPERATOR_EQUALS;
            $queryFragment .= $this->getParameterNameForColumName($columnName);

            return $queryFragment;
        }

        // Generates a query fragment that combines the specified column names
        // with "ASC" or "DESC" keywords. The result can be used in an
        // ORDER BY clause.
        //
        // The first specified array lists the column names, the second
        // specified array lists how each column should be ordered. The second
        // array must have the same number of elements as the first array. A
        // true value orders the column ascending, a false value orders the
        // column descending.
        //
        // This is private helper function.
        private function getColumnsWithOrderings(array $columnNames, array $orderings): string
        {
            $columnNamesWithOrderings = array_combine($columnNames, $orderings);

            $queryFragment = "";
            foreach ($columnNamesWithOrderings as $columnName => $ordering)
            {
                $queryFragment .= SQL_OPERATOR_COMMA;
                $queryFragment .= $this->getColumnWithOrdering($columnName, $ordering);
            }

            if (strlen($queryFragment) > 0)
                $queryFragment = substr($queryFragment, strlen(SQL_OPERATOR_COMMA));

            return $queryFragment;
        }

        // Generates a query fragment that combines the specified column name
        // with an "ASC" or "DESC" keyword. The result can be used in an
        // ORDER BY clause.
        //
        // This is private helper function.
        private function getColumnWithOrdering(string $columnName, bool $ascending): string
        {
            $queryFragment = $columnName;
            if ($ascending)
                $queryFragment .= SQL_OPERATOR_ASCENDING;
            else
                $queryFragment .= SQL_OPERATOR_DESCENDING;

            return $queryFragment;
        }

        // Returns the parameter name for the specified column name.
        public function getParameterNameForColumName(string $columnName): string
        {
            return PREPARED_STATEMENT_PARAMETER_PREFIX . $columnName;
        }

        // Returns a fully qualified table name for the specified unqualified
        // table name.
        private function getFullyQualifiedTableName(string $unqualifiedTableName)
        {
            return SQL_QUOTE_CHARACTER . $this->databaseName . SQL_QUOTE_CHARACTER . SQL_NAME_SEPARATOR . $unqualifiedTableName;
        }
    }
}
