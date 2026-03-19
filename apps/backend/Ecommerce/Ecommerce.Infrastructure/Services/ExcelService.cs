using Ecommerce.Application.Common.Interfaces;
using CsvHelper;
using OfficeOpenXml;
using System.ComponentModel;
using System.Globalization;
using System.Reflection;

namespace Ecommerce.Infrastructure.Services
{
    public class ExcelService : IExcelService
    {
        public ExcelService()
        {
            // Set the license context for EPPlus
            ExcelPackage.License.SetNonCommercialPersonal("Ecommerce");
        }

        public async Task<List<T>> ReadExcelAsync<T>(Stream fileStream) where T : class, new()
        {
            var result = new List<T>();

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets[0]; // Get the first sheet
                var rowCount = worksheet.Dimension.Rows;
                var colCount = worksheet.Dimension.Columns;

                // Get headers for mapping
                var headers = new Dictionary<string, int>();
                for (int col = 1; col <= colCount; col++)
                {
                    string header = worksheet.Cells[1, col].Text.Trim();
                    if (!string.IsNullOrEmpty(header))
                    {
                        headers[header] = col;
                    }
                }

                // Read data from the second row
                for (int row = 2; row <= rowCount; row++)
                {
                    var item = new T();
                    var properties = typeof(T).GetProperties();

                    foreach (var prop in properties)
                    {
                        var displayNameAttr = prop.GetCustomAttribute<DisplayNameAttribute>();
                        var columnName = displayNameAttr != null ? displayNameAttr.DisplayName : prop.Name;

                        if (headers.TryGetValue(columnName, out int col))
                        {
                            var cell = worksheet.Cells[row, col];
                            if (cell.Value != null)
                            {
                                SetPropertyValue(item, prop, cell.Value);
                            }
                        }
                    }

                    result.Add(item);
                }
            }

            return result;
        }

        public async Task<byte[]> ExportToExcelAsync<T>(List<T> data, string sheetName = "Sheet1")
        {
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add(sheetName);
                var properties = typeof(T).GetProperties();

                // Create header
                for (int col = 0; col < properties.Length; col++)
                {
                    var prop = properties[col];
                    var displayNameAttr = prop.GetCustomAttribute<DisplayNameAttribute>();
                    var columnName = displayNameAttr != null ? displayNameAttr.DisplayName : prop.Name;

                    worksheet.Cells[1, col + 1].Value = columnName;
                    worksheet.Cells[1, col + 1].Style.Font.Bold = true;
                }

                // Add data
                for (int row = 0; row < data.Count; row++)
                {
                    for (int col = 0; col < properties.Length; col++)
                    {
                        var value = properties[col].GetValue(data[row]);
                        worksheet.Cells[row + 2, col + 1].Value = value;
                    }
                }

                // Auto-fit columns
                for (int col = 1; col <= properties.Length; col++)
                {
                    worksheet.Column(col).AutoFit();
                }

                return package.GetAsByteArray();
            }
        }

        public async Task<List<T>> ReadCsvAsync<T>(Stream fileStream) where T : class, new()
        {
            using (var reader = new StreamReader(fileStream))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                return csv.GetRecords<T>().ToList();
            }
        }

        public async Task<byte[]> ExportToCsvAsync<T>(List<T> data)
        {
            using (var memoryStream = new MemoryStream())
            using (var writer = new StreamWriter(memoryStream))
            using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
            {
                csv.WriteRecords(data);
                writer.Flush();
                return memoryStream.ToArray();
            }
        }

        private void SetPropertyValue(object obj, PropertyInfo prop, object value)
        {
            if (value == null) return;

            Type propType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

            if (propType == typeof(Guid) || propType == typeof(Guid?))
            {
                if (Guid.TryParse(value.ToString(), out Guid guidValue))
                {
                    prop.SetValue(obj, guidValue);
                }
            }
            else if (propType == typeof(DateTime) || propType == typeof(DateTime?))
            {
                if (value is DateTime dateValue)
                {
                    prop.SetValue(obj, dateValue);
                }
                else if (DateTime.TryParse(value.ToString(), out DateTime parsedDate))
                {
                    prop.SetValue(obj, parsedDate);
                }
            }
            else
            {
                prop.SetValue(obj, Convert.ChangeType(value, propType));
            }
        }
    }
}
