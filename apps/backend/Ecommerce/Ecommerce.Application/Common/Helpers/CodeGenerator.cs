namespace Ecommerce.Application.Common.Helpers
{
    public static class CodeGenerator
    {
        public static string OrderGenerate()
        {
            return $"ORD-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        }


    }
}

