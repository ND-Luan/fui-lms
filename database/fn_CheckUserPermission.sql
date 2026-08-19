/*
    Kiểm tra quyền dùng chung cho các Stored Procedure/API.

    Quy ước:
    - @AllowedSystemRights có dạng token: '[1][3][9]'.
    - @RequiredFunctionCode = NULL nếu API không yêu cầu FunctionRight.
    - SystemRight = 9 là System Admin và được toàn quyền.
    - FunctionRight do tAPI inject, có dạng token: '[10][20]'.
*/
CREATE OR ALTER FUNCTION dbo.fn_CheckUserPermission
(
    @SystemRight int,
    @FunctionRight varchar(2000),
    @AllowedSystemRights varchar(100),
    @RequiredFunctionCode int
)
RETURNS bit
AS
BEGIN
    DECLARE @Result bit = 0;
    DECLARE @SystemRightToken varchar(20);
    DECLARE @FunctionRightToken varchar(20);

    -- System Admin được toàn quyền.
    IF ISNULL(@SystemRight, 0) = 9
        RETURN 1;

    SET @SystemRightToken = '[' + CONVERT(varchar(10), @SystemRight) + ']';

    -- SystemRight phải nằm trong danh sách được phép của API.
    IF CHARINDEX(@SystemRightToken, ISNULL(@AllowedSystemRights, '')) = 0
        RETURN 0;

    -- Không truyền FunctionCode nghĩa là API chỉ kiểm tra SystemRight.
    IF @RequiredFunctionCode IS NULL
        RETURN 1;

    SET @FunctionRightToken = '[' + CONVERT(varchar(10), @RequiredFunctionCode) + ']';

    IF CHARINDEX(@FunctionRightToken, ISNULL(@FunctionRight, '')) > 0
        SET @Result = 1;

    RETURN @Result;
END;
GO
