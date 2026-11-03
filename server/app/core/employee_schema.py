"""기존 직원 데이터를 보존하는 부서 열 추가. 반복 실행 가능."""
from sqlalchemy import inspect, text
from app.models.employees import Employees


def ensure_employee_schema(engine):
    with engine.begin() as connection:
        Employees.__table__.create(connection, checkfirst=True)
        columns = {column["name"] for column in inspect(connection).get_columns("employees")}
        if "department" not in columns:
            connection.execute(text("ALTER TABLE employees ADD COLUMN department VARCHAR(50)"))
