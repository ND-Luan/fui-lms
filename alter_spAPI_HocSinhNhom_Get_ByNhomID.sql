ALTER PROC [dbo].[spAPI_HocSinhNhom_Get_ByNhomID]
    @NienKhoa INT,
    @NhomID VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        hsn.HSNhomID,
        hsn.HocSinhID,
        hsn.NhomID,
        hsn.LopID,
        hsn.SoTT,
        hs.Ho,
        hs.Ten,
        hs.Ho + ' ' + hs.Ten AS HoTen,
        hs.TinhTrang,
        hs.TenTinhTrang,
        hs.EnglishName,
        l.TenLop,
        mhl.MonHocLopID
    FROM dbo.tblHocSinhNhom AS hsn
    INNER JOIN dbo.tblNhom AS n
        ON n.NhomID = hsn.NhomID
       AND n.NienKhoa = @NienKhoa
       AND n.Enable = 1
    INNER JOIN dbo.tblHocSinh AS hs
        ON hs.HocSinhID = hsn.HocSinhID
       AND hs.TinhTrang = 0
    INNER JOIN dbo.tblLop AS l
        ON l.LopID = hsn.LopID
       AND l.NienKhoa = @NienKhoa
       AND l.Enable = 1
    INNER JOIN dbo.tblMonHocLop AS mhl
        ON mhl.LopNhomID = hsn.NhomID
       AND mhl.NienKhoa = @NienKhoa
       AND mhl.Enable = 1
    WHERE hsn.NhomID = @NhomID
      AND hsn.Enable = 1
    ORDER BY hsn.SoTT;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.tblHocSinhNhom')
      AND name = N'IX_tblHocSinhNhom_NhomID_Enable'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_tblHocSinhNhom_NhomID_Enable
        ON dbo.tblHocSinhNhom (NhomID, Enable)
        INCLUDE (HSNhomID, HocSinhID, LopID, SoTT);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.tblMonHocLop')
      AND name = N'IX_tblMonHocLop_LopNhomID_NienKhoa_Enable'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_tblMonHocLop_LopNhomID_NienKhoa_Enable
        ON dbo.tblMonHocLop (LopNhomID, NienKhoa, Enable)
        INCLUDE (MonHocLopID);
END
GO

GRANT EXECUTE ON [dbo].[spAPI_HocSinhNhom_Get_ByNhomID] TO [lmslhbs];
GO
