SELECT KyNang_MonHocID
     , MonHocID
     , NhomKyNang
     , IsDeleted
     , CreateUser
     , CreateTime
     , UpdateUser
     , UpdateTime FROM dbo.tblEL_KyNang_MonHoc
SELECT KyNang_MonHoc_ChiTietID
     , KyNang_MonHocID
     , TenKyNang
     , MoTaKyNang
     , IsDeleted
     , CreateUser
     , CreateTime
     , UpdateUser
     , UpdateTime FROM dbo.tblEL_KyNang_MonHoc_ChiTiet
     USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Del]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Del]
    @KyNang_MonHoc_ChiTietID INT
  , @SYS_USERID              VARCHAR(9)
AS
BEGIN
    UPDATE tblEL_KyNang_MonHoc_ChiTiet
    SET    IsDeleted = 1
         , UpdateUser = @SYS_USERID
         , UpdateTime = GETDATE()
    WHERE
           KyNang_MonHoc_ChiTietID = @KyNang_MonHoc_ChiTietID;
END;
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Get]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Get] 1
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Get] @KyNang_MonHocID INT
AS
BEGIN
    SELECT 
		  ct.KyNang_MonHoc_ChiTietID	
		, ct.KyNang_MonHocID	
		, ct.TenKyNang	
		, ct.MoTaKyNang
		, mh.NhomKyNang
    FROM
           tblEL_KyNang_MonHoc_ChiTiet ct
		INNER JOIN dbo.tblEL_KyNang_MonHoc mh ON mh.KyNang_MonHocID = ct.KyNang_MonHocID AND mh.IsDeleted = 0
    WHERE
           ct.KyNang_MonHocID = @KyNang_MonHocID
      AND  ct.IsDeleted        = 0;
END;
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Ins]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Ins]
    @KyNang_MonHocID INT
  , @TenKyNang       NVARCHAR(200)
  , @MoTaKyNang      NVARCHAR(1000)
  , @SYS_USERID      VARCHAR(9)
AS
BEGIN
    INSERT INTO tblEL_KyNang_MonHoc_ChiTiet
    (
        KyNang_MonHocID
      , TenKyNang
      , MoTaKyNang
      , CreateUser
      , CreateTime
    )
    VALUES
    (
        @KyNang_MonHocID
      , @TenKyNang
      , @MoTaKyNang
      , @SYS_USERID
      , GETDATE()
    );
END;
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Upd]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_ChiTiet_Upd]
    @KyNang_MonHoc_ChiTietID INT
  , @TenKyNang               NVARCHAR(200)
  , @MoTaKyNang              NVARCHAR(1000)
  , @SYS_USERID              VARCHAR(9)
AS
BEGIN
    UPDATE tblEL_KyNang_MonHoc_ChiTiet
    SET    TenKyNang = @TenKyNang
         , MoTaKyNang = @MoTaKyNang
         , UpdateUser = @SYS_USERID
         , UpdateTime = GETDATE()
    WHERE
           KyNang_MonHoc_ChiTietID = @KyNang_MonHoc_ChiTietID;
END;
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_Del]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_Del]
    @KyNang_MonHocID INT
  , @SYS_USERID      VARCHAR(9)
AS
BEGIN
    UPDATE dbo.tblEL_KyNang_MonHoc
    SET    IsDeleted = 1
         , UpdateUser = @SYS_USERID
         , UpdateTime = GETDATE()
    WHERE
           KyNang_MonHocID = @KyNang_MonHocID;
END;
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_Get]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_Get] @MonHocID INT
AS
BEGIN
    SELECT *
    FROM
           tblEL_KyNang_MonHoc
    WHERE
           IsDeleted = 0
      AND  MonHocID   = @MonHocID;
END;
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_Ins]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_Ins]
    @MonHocID   INT
  , @NhomKyNang NVARCHAR(200)
  , @SYS_USERID VARCHAR(9)
AS
BEGIN
    INSERT INTO tblEL_KyNang_MonHoc
    (
        MonHocID
      , NhomKyNang
      , CreateUser
      , CreateTime
    )
    VALUES
    (
        @MonHocID
      , @NhomKyNang
      , @SYS_USERID
      , GETDATE()
    );
END;
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_KyNang_MonHoc_Upd]    Script Date: 2026-04-15 3:45:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[spAPI_EL_KyNang_MonHoc_Upd]
    @MonHocID        INT
  , @NhomKyNang      NVARCHAR(200)
  , @KyNang_MonHocID INT
  , @SYS_USERID      VARCHAR(9)
AS
BEGIN
    UPDATE dbo.tblEL_KyNang_MonHoc
    SET    MonHocID = @MonHocID
         , NhomKyNang = @NhomKyNang
         , UpdateUser = @SYS_USERID
         , UpdateTime = GETDATE()
    WHERE
           KyNang_MonHocID = @KyNang_MonHocID;
END;
GO
