namespace Ecommerce.Domain.Interfaces.Base
{
    public interface ISoftDelete
    {
        bool IsDeleted { get; set; }
    }
}
