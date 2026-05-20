USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_KhoaCotDiem_Ins_And_Upd]    Script Date: 2026-05-20 9:26:43 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[spAPI_KhoaCotDiem_Ins_And_Upd]
    @LopID         VARCHAR(50)
  , @MonHocLopID   INT
  , @MaCotDiem     VARCHAR(200)
  , @IsKhoaCotDiem BIT
  , @SYS_USERID    VARCHAR(9)
AS
BEGIN
    DECLARE @KhoaCotDiemID INT = 0;
  SELECT TOP 1
    @KhoaCotDiemID = KhoaCotDiemID
  FROM tblKhoaCotDiem
  WHERE LopID = @LopID
    AND MonHocLopID = @MonHocLopID
    AND MaCotDiem = @MaCotDiem
    AND Enable = 1
  ORDER BY KhoaCotDiemID DESC;

    IF (@KhoaCotDiemID = 0)
    BEGIN
        INSERT INTO tblKhoaCotDiem
        (
            LopID
          , MonHocLopID
          , MaCotDiem
          , Enable
          , TinhTrang
          , CreateUser
          , CreateTime
        )
        VALUES
        (
            @LopID
          , @MonHocLopID
          , @MaCotDiem
          , 1
          , IIF(@IsKhoaCotDiem = 1, 1, 0)
          , @SYS_USERID
          , GETDATE()
        );
		 SET @KhoaCotDiemID = SCOPE_IDENTITY();
    END;
    ELSE IF (@KhoaCotDiemID > 0)
    BEGIN
        IF (@IsKhoaCotDiem = 1)
        BEGIN
            UPDATE tblKhoaCotDiem
            SET    TinhTrang = 1
                 , UpdateUser = @SYS_USERID
                 , UpdateTime = GETDATE()
            WHERE
                   LopID      = @LopID
              AND  MonHocLopID = @MonHocLopID
              AND  MaCotDiem   = @MaCotDiem;
        END;
    END;

	--OUT ra KhoaCotDiemID
	SELECT @KhoaCotDiemID 
END;