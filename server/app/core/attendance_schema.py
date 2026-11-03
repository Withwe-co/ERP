"""기존 직원 테이블을 보존하는 근태 스키마 추가. 반복 실행 가능."""
from sqlalchemy import inspect, text
from app.models.employees import Employees
from app.models.attendance import EmployeeAttendance


def ensure_attendance_schema(engine):
    with engine.begin() as connection:
        Employees.__table__.create(connection, checkfirst=True)
        columns = {column["name"] for column in inspect(connection).get_columns("employees")}
        if "caps_user_id" not in columns:
            connection.execute(text("ALTER TABLE employees ADD COLUMN caps_user_id VARCHAR(50)"))
        connection.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_employees_caps_user_id "
            "ON employees (caps_user_id)"
        ))
        EmployeeAttendance.__table__.create(connection, checkfirst=True)
