using System.Collections;
using System.Reflection;
using Ecommerce.Domain.Interfaces;
using FluentAssertions;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Validators;

public class FluentValidationValidatorTests
{
    [Theory]
    [MemberData(nameof(ValidatorScenarios.All), MemberType = typeof(ValidatorScenarios))]
    public async Task Validate_ValidInput_IsValid(ValidatorScenario scenario)
    {
        // Arrange
        var validator = ValidatorFactory.Create(scenario.ValidatorType);
        var command = CommandFactory.CreateValid(scenario.CommandType);

        // Act
        var result = await validator.ValidateAsync(CommandFactory.CreateContext(command));

        // Assert
        result.IsValid.Should().BeTrue(scenario.DisplayName);
    }

    [Theory]
    [MemberData(nameof(ValidatorScenarios.All), MemberType = typeof(ValidatorScenarios))]
    public async Task Validate_MissingRequiredField_IsInvalidWithExpectedError(ValidatorScenario scenario)
    {
        // Arrange
        var validator = ValidatorFactory.Create(scenario.ValidatorType);
        var command = CommandFactory.CreateValid(scenario.CommandType);
        CommandFactory.ApplyInvalidValue(command, scenario.RequiredErrorProperty);

        // Act
        var result = await validator.ValidateAsync(CommandFactory.CreateContext(command));

        // Assert
        result.IsValid.Should().BeFalse(scenario.DisplayName);
        result.Errors.Should().Contain(error =>
            error.PropertyName == scenario.RequiredErrorProperty &&
            !string.IsNullOrWhiteSpace(error.ErrorMessage));
    }

    [Theory]
    [MemberData(nameof(ValidatorScenarios.All), MemberType = typeof(ValidatorScenarios))]
    public async Task Validate_InvalidFormatOrBoundary_IsInvalidWithExpectedError(ValidatorScenario scenario)
    {
        // Arrange
        var validator = ValidatorFactory.Create(scenario.ValidatorType);
        var command = CommandFactory.CreateValid(scenario.CommandType);
        CommandFactory.ApplyInvalidValue(command, scenario.FormatOrBoundaryErrorProperty);

        // Act
        var result = await validator.ValidateAsync(CommandFactory.CreateContext(command));

        // Assert
        result.IsValid.Should().BeFalse(scenario.DisplayName);
        result.Errors.Should().Contain(error =>
            error.PropertyName == scenario.FormatOrBoundaryErrorProperty &&
            !string.IsNullOrWhiteSpace(error.ErrorMessage));
    }
}

public sealed record ValidatorScenario(
    Type ValidatorType,
    Type CommandType,
    string RequiredErrorProperty,
    string FormatOrBoundaryErrorProperty)
{
    public string DisplayName => ValidatorType.Name;

    public override string ToString() => DisplayName;
}

public static class ValidatorScenarios
{
    public static IEnumerable<object[]> All()
    {
        yield return Scenario<global::Ecommerce.Application.Features.Account.Commands.UpdateProfile.UpdateProfileCommandValidator, global::Ecommerce.Application.Features.Account.Commands.UpdateProfile.UpdateProfileCommand>("FirstName", "PhoneNumber");
        yield return Scenario<global::Ecommerce.Application.Features.Auth.Commands.LoginUser.LoginUserCommandValidator, global::Ecommerce.Application.Features.Auth.Commands.LoginUser.LoginUserCommand>("Email", "Email");
        yield return Scenario<global::Ecommerce.Application.Features.Auth.Commands.RefreshToken.RefreshTokenCommandValidator, global::Ecommerce.Application.Features.Auth.Commands.RefreshToken.RefreshTokenCommand>("AccessToken", "RefreshToken");
        yield return Scenario<global::Ecommerce.Application.Features.Auth.Commands.RegisterUser.RegisterCommandValidator, global::Ecommerce.Application.Features.Auth.Commands.RegisterUser.RegisterCommand>("Email", "Password");
        yield return Scenario<global::Ecommerce.Application.Features.Auth.Commands.RevokeToken.RevokeTokenCommandValidator, global::Ecommerce.Application.Features.Auth.Commands.RevokeToken.RevokeTokenCommand>("RefreshToken", "RefreshToken");
        yield return Scenario<global::Ecommerce.Application.Features.Brands.Commands.CreateBrand.CreateBrandCommandValidator, global::Ecommerce.Application.Features.Brands.Commands.CreateBrand.CreateBrandCommand>("Code", "Description");
        yield return Scenario<global::Ecommerce.Application.Features.Brands.Commands.DeleteBrand.DeleteBrandCommandValidator, global::Ecommerce.Application.Features.Brands.Commands.DeleteBrand.DeleteBrandCommand>("Id", "Id");
        yield return Scenario<global::Ecommerce.Application.Features.Brands.Commands.UpdateBrand.UpdateBrandCommandValidator, global::Ecommerce.Application.Features.Brands.Commands.UpdateBrand.UpdateBrandCommand>("Id", "Description");
        yield return Scenario<global::Ecommerce.Application.Features.Cart.Commands.AddToCart.AddToCartCommandValidator, global::Ecommerce.Application.Features.Cart.Commands.AddToCart.AddToCartCommand>("ProductId", "Quantity");
        yield return Scenario<global::Ecommerce.Application.Features.Cart.Commands.ApplyPromoCode.ApplyPromoCodeCommandValidator, global::Ecommerce.Application.Features.Cart.Commands.ApplyPromoCode.ApplyPromoCodeCommand>("Code", "Code");
        yield return Scenario<global::Ecommerce.Application.Features.Cart.Commands.UpdateCartItem.UpdateCartItemCommandValidator, global::Ecommerce.Application.Features.Cart.Commands.UpdateCartItem.UpdateCartItemCommand>("ItemId", "Quantity");
        yield return Scenario<global::Ecommerce.Application.Features.Categories.Commands.CreateCategory.CreateCategoryCommandValidator, global::Ecommerce.Application.Features.Categories.Commands.CreateCategory.CreateCategoryCommand>("Code", "Description");
        yield return Scenario<global::Ecommerce.Application.Features.Categories.Commands.UpdateCategory.UpdateCategoryCommandValidator, global::Ecommerce.Application.Features.Categories.Commands.UpdateCategory.UpdateCategoryCommand>("Id", "Description");
        yield return Scenario<global::Ecommerce.Application.Features.Categories.Queries.GetCategories.GetCategoriesQueryValidator, global::Ecommerce.Application.Features.Categories.Queries.GetCategories.GetCategoriesQuery>("PageNumber", "SortBy");
        yield return Scenario<global::Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand.CreateCategoryBrandCommandValidator, global::Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand.CreateCategoryBrandCommand>("CategoryId", "BrandId");
        yield return Scenario<global::Ecommerce.Application.Features.CustomerAddresses.Commands.CreateCustomerAddress.CreateCustomerAddressCommandValidator, global::Ecommerce.Application.Features.CustomerAddresses.Commands.CreateCustomerAddress.CreateCustomerAddressCommand>("ApplicationUserId", "Phone");
        yield return Scenario<global::Ecommerce.Application.Features.CustomerAddresses.Commands.UpdateCustomerAddress.UpdateCustomerAddressCommandValidator, global::Ecommerce.Application.Features.CustomerAddresses.Commands.UpdateCustomerAddress.UpdateCustomerAddressCommand>("Id", "Phone");
        yield return Scenario<global::Ecommerce.Application.Features.Marquee.Commands.CreateMarqueeMessage.CreateMarqueeMessageCommandValidator, global::Ecommerce.Application.Features.Marquee.Commands.CreateMarqueeMessage.CreateMarqueeMessageCommand>("Content", "LinkUrl");
        yield return Scenario<global::Ecommerce.Application.Features.Marquee.Commands.UpdateMarqueeMessage.UpdateMarqueeMessageCommandValidator, global::Ecommerce.Application.Features.Marquee.Commands.UpdateMarqueeMessage.UpdateMarqueeMessageCommand>("Id", "LinkUrl");
        yield return Scenario<global::Ecommerce.Application.Features.Notifications.Commands.SendMaintenanceNotification.SendMaintenanceNotificationCommandValidator, global::Ecommerce.Application.Features.Notifications.Commands.SendMaintenanceNotification.SendMaintenanceNotificationCommand>("Title", "ActionUrl");
        yield return Scenario<global::Ecommerce.Application.Features.Notifications.Commands.SendPromotionNotification.SendPromotionNotificationCommandValidator, global::Ecommerce.Application.Features.Notifications.Commands.SendPromotionNotification.SendPromotionNotificationCommand>("Title", "ImageUrl");
        yield return Scenario<global::Ecommerce.Application.Features.Orders.Commands.CreateOrder.CreateOrderCommandValidator, global::Ecommerce.Application.Features.Orders.Commands.CreateOrder.CreateOrderCommand>("ShippingAddress", "Email");
        yield return Scenario<global::Ecommerce.Application.Features.Orders.Commands.UpdateOrder.UpdateOrderCommandValidator, global::Ecommerce.Application.Features.Orders.Commands.UpdateOrder.UpdateOrderCommand>("ShippingAddress", "Email");
        yield return Scenario<global::Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus.UpdateOrderStatusCommandValidator, global::Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus.UpdateOrderStatusCommand>("Id", "ExpectedDeliveryDate");
        yield return Scenario<global::Ecommerce.Application.Features.Permissions.Commands.CreatePermission.CreatePermissionCommandValidator, global::Ecommerce.Application.Features.Permissions.Commands.CreatePermission.CreatePermissionCommand>("Name", "Name");
        yield return Scenario<global::Ecommerce.Application.Features.Permissions.Commands.UpdatePermission.UpdatePermissionCommandValidator, global::Ecommerce.Application.Features.Permissions.Commands.UpdatePermission.UpdatePermissionCommand>("Id", "Name");
        yield return Scenario<global::Ecommerce.Application.Features.Products.Commands.CreateProduct.CreateProductCommandValidator, global::Ecommerce.Application.Features.Products.Commands.CreateProduct.CreateProductCommand>("Code", "SalePrice");
        yield return Scenario<global::Ecommerce.Application.Features.Products.Commands.UpdateProduct.UpdateProductCommandValidator, global::Ecommerce.Application.Features.Products.Commands.UpdateProduct.UpdateProductCommand>("Id", "SalePrice");
        yield return Scenario<global::Ecommerce.Application.Features.Products.Queries.SearchProducts.SearchProductsQueryValidator, global::Ecommerce.Application.Features.Products.Queries.SearchProducts.SearchProductsQuery>("PageNumber", "SortBy");
        yield return Scenario<global::Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode.ApplyPromoCodeCommandValidator, global::Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode.ApplyPromoCodeCommand>("Code", "OrderTotal");
        yield return Scenario<global::Ecommerce.Application.Features.PromoCodes.Commands.CreatePromoCode.CreatePromoCodeCommandValidator, global::Ecommerce.Application.Features.PromoCodes.Commands.CreatePromoCode.CreatePromoCodeCommand>("Code", "Type");
        yield return Scenario<global::Ecommerce.Application.Features.PromoCodes.Commands.UpdatePromoCode.UpdatePromoCodeCommandValidator, global::Ecommerce.Application.Features.PromoCodes.Commands.UpdatePromoCode.UpdatePromoCodeCommand>("Id", "Type");
        yield return Scenario<global::Ecommerce.Application.Features.Roles.Commands.CreateRole.CreateRoleCommandValidator, global::Ecommerce.Application.Features.Roles.Commands.CreateRole.CreateRoleCommand>("Name", "Name");
        yield return Scenario<global::Ecommerce.Application.Features.Users.Commands.ChangePassword.ChangePasswordCommandValidator, global::Ecommerce.Application.Features.Users.Commands.ChangePassword.ChangePasswordCommand>("UserId", "NewPassword");
        yield return Scenario<global::Ecommerce.Application.Features.Users.Commands.CreateUser.CreateUserCommandValidator, global::Ecommerce.Application.Features.Users.Commands.CreateUser.CreateUserCommand>("Email", "PhoneNumber");
        yield return Scenario<global::Ecommerce.Application.Features.Users.Commands.UpdateUser.UpdateUserCommandValidator, global::Ecommerce.Application.Features.Users.Commands.UpdateUser.UpdateUserCommand>("Id", "PhoneNumber");
    }

    private static object[] Scenario<TValidator, TCommand>(string requiredProperty, string formatOrBoundaryProperty)
        where TValidator : IValidator<TCommand>
    {
        return [new ValidatorScenario(typeof(TValidator), typeof(TCommand), requiredProperty, formatOrBoundaryProperty)];
    }
}

internal static class ValidatorFactory
{
    public static IValidator Create(Type validatorType)
    {
        var constructor = validatorType.GetConstructors().Single();
        var parameters = constructor.GetParameters()
            .Select(parameter => CreateDependency(parameter.ParameterType, validatorType))
            .ToArray();

        return (IValidator)constructor.Invoke(parameters);
    }

    private static object CreateDependency(Type parameterType, Type validatorType)
    {
        if (parameterType == typeof(IBrandRepository))
        {
            var mock = new Mock<IBrandRepository>();
            mock.Setup(x => x.ExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            mock.Setup(x => x.IsCodeUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            return mock.Object;
        }

        if (parameterType == typeof(ICategoryRepository))
        {
            var mock = new Mock<ICategoryRepository>();
            mock.Setup(x => x.ExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            mock.Setup(x => x.IsCodeUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            return mock.Object;
        }

        if (parameterType == typeof(ICustomerAddressRepository))
        {
            var mock = new Mock<ICustomerAddressRepository>();
            mock.Setup(x => x.ExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            mock.Setup(x => x.UserOwnsAddressAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            return mock.Object;
        }

        if (parameterType == typeof(IProductRepository))
        {
            var isUpdateValidator = validatorType.Name.StartsWith("UpdateProduct", StringComparison.Ordinal);
            var uniqueResult = !isUpdateValidator;
            var mock = new Mock<IProductRepository>();
            mock.Setup(x => x.ExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            mock.Setup(x => x.IsCodeUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(uniqueResult);
            mock.Setup(x => x.IsSkuUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(uniqueResult);
            return mock.Object;
        }

        if (parameterType == typeof(IPromoCodeRepository))
        {
            var mock = new Mock<IPromoCodeRepository>();
            mock.Setup(x => x.IsCodeUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>()))
                .ReturnsAsync(true);
            return mock.Object;
        }

        throw new NotSupportedException($"No test dependency configured for {parameterType.Name}.");
    }
}

internal static class CommandFactory
{
    public static IValidationContext CreateContext(object command)
    {
        var contextType = typeof(ValidationContext<>).MakeGenericType(command.GetType());
        return (IValidationContext)Activator.CreateInstance(contextType, command)!;
    }

    public static object CreateValid(Type commandType)
    {
        var command = Activator.CreateInstance(commandType)!;
        FillWritableProperties(command);
        ApplyValidOverrides(command);
        return command;
    }

    public static void ApplyInvalidValue(object command, string propertyName)
    {
        var property = command.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance)
            ?? throw new InvalidOperationException($"Property '{propertyName}' not found on {command.GetType().Name}.");

        switch (propertyName)
        {
            case "Email":
                SetProperty(command, property, "invalid-email");
                return;
            case "Phone":
            case "PhoneNumber":
                SetProperty(command, property, "not-a-phone");
                return;
            case "ActionUrl":
            case "ImageUrl":
            case "LinkUrl":
                SetProperty(command, property, "not-a-url");
                return;
            case "SortBy":
                SetProperty(command, property, "unsupported-sort");
                return;
            case "Type":
                SetProperty(command, property, "UnknownPromoType");
                return;
            case "Password":
            case "NewPassword":
                SetProperty(command, property, "weak");
                return;
            case "SalePrice":
                SetProperty(command, command.GetType().GetProperty("Price")!, 100m);
                SetProperty(command, property, 150m);
                return;
            case "ExpectedDeliveryDate":
                SetProperty(command, command.GetType().GetProperty("Status")!, global::Ecommerce.Domain.Enums.EOrderStatus.Processing);
                SetProperty(command, property, DateTime.Now.AddDays(-1));
                return;
            case "OrderTotal":
                SetProperty(command, property, 0m);
                return;
            case "Quantity":
                SetProperty(command, property, -1);
                return;
            case "PageNumber":
            case "DurationMinutes":
                SetProperty(command, property, 0);
                return;
            case "Id":
            case "ItemId":
            case "ProductId":
            case "CategoryId":
            case "BrandId":
            case "ApplicationUserId":
            case "UserId":
                SetProperty(command, property, Guid.Empty);
                return;
        }

        var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
        if (targetType == typeof(string))
        {
            SetProperty(command, property, propertyName == "Description" ? new string('x', 1001) : string.Empty);
        }
        else if (targetType == typeof(Guid))
        {
            SetProperty(command, property, Guid.Empty);
        }
        else if (targetType == typeof(int))
        {
            SetProperty(command, property, -1);
        }
        else if (targetType == typeof(decimal))
        {
            SetProperty(command, property, -1m);
        }
        else if (targetType == typeof(double))
        {
            SetProperty(command, property, -1d);
        }
        else if (typeof(IList).IsAssignableFrom(property.PropertyType))
        {
            var list = (IList)Activator.CreateInstance(property.PropertyType)!;
            SetProperty(command, property, list);
        }
        else
        {
            throw new NotSupportedException($"No invalid value configured for {property.Name} ({property.PropertyType.Name}).");
        }
    }

    private static void FillWritableProperties(object instance)
    {
        foreach (var property in instance.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance)
                     .Where(property => property.CanWrite))
        {
            SetProperty(instance, property, CreateValidValue(property));
        }
    }

    private static object? CreateValidValue(PropertyInfo property)
    {
        var type = property.PropertyType;
        var underlyingType = Nullable.GetUnderlyingType(type);
        var targetType = underlyingType ?? type;

        if (targetType == typeof(string))
        {
            return CreateValidString(property.Name);
        }

        if (targetType == typeof(Guid))
        {
            return Guid.NewGuid();
        }

        if (targetType == typeof(int))
        {
            return property.Name switch
            {
                "PageSize" => 10,
                "Speed" => 50,
                "DurationMinutes" => 60,
                "PromotionPoints" => 0,
                _ => 1
            };
        }

        if (targetType == typeof(decimal))
        {
            return property.Name switch
            {
                "Price" => 100m,
                "SalePrice" => 80m,
                "MinPrice" => 10m,
                "MaxPrice" => 100m,
                "OrderTotal" => 100m,
                _ => 10m
            };
        }

        if (targetType == typeof(double))
        {
            return property.Name == "Rating" ? 4d : 1d;
        }

        if (targetType == typeof(bool))
        {
            return true;
        }

        if (targetType == typeof(DateTime))
        {
            return property.Name == "ValidFrom"
                ? DateTime.UtcNow.AddDays(1)
                : DateTime.UtcNow.AddDays(10);
        }

        if (targetType.IsEnum)
        {
            return Enum.GetValues(targetType).GetValue(0);
        }

        if (typeof(IFormFile).IsAssignableFrom(targetType))
        {
            return CreateFormFile(1024);
        }

        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(List<>))
        {
            return CreateValidList(type);
        }

        return underlyingType is null ? Activator.CreateInstance(type) : null;
    }

    private static string CreateValidString(string propertyName)
    {
        return propertyName switch
        {
            "Email" => "valid@example.com",
            "Password" => "StrongPass1!",
            "CurrentPassword" => "OldPass1!",
            "NewPassword" => "NewPass1!",
            "ConfirmNewPassword" => "NewPass1!",
            "ConfirmPassword" => "StrongPass1!",
            "Phone" => "+84912345678",
            "PhoneNumber" => "0912345678",
            "Role" => global::Ecommerce.Domain.Enums.EUserRoles.Customer,
            "Type" => global::Ecommerce.Domain.Entities.PromoCodeType.PercentageDiscount.ToString(),
            "SortBy" => "name",
            "Name" => "ValidName",
            "ActionUrl" or "ImageUrl" or "LinkUrl" => "https://example.com/path",
            "RowVersion" => Convert.ToBase64String([1, 2, 3, 4]),
            _ => $"Valid {propertyName}"
        };
    }

    private static object CreateValidList(Type listType)
    {
        var itemType = listType.GetGenericArguments()[0];
        var list = (IList)Activator.CreateInstance(listType)!;

        if (itemType == typeof(Guid))
        {
            list.Add(Guid.NewGuid());
        }
        else if (itemType == typeof(string))
        {
            list.Add("Valid value");
        }
        else if (typeof(IFormFile).IsAssignableFrom(itemType))
        {
            list.Add(CreateFormFile(1024));
        }
        else
        {
            var item = Activator.CreateInstance(itemType)!;
            FillWritableProperties(item);
            list.Add(item);
        }

        return list;
    }

    private static IFormFile CreateFormFile(long length)
    {
        var file = new Mock<IFormFile>();
        file.Setup(x => x.Length).Returns(length);
        return file.Object;
    }

    private static void ApplyValidOverrides(object command)
    {
        var type = command.GetType();

        if (type.FullName == "Ecommerce.Application.Features.Orders.Commands.CreateOrder.CreateOrderCommand")
        {
            SetProperty(command, type.GetProperty("ApplicationUserId")!, Guid.NewGuid());
            SetProperty(command, type.GetProperty("GuestName")!, string.Empty);
        }

        if (type.FullName == "Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus.UpdateOrderStatusCommand")
        {
            SetProperty(command, type.GetProperty("Status")!, global::Ecommerce.Domain.Enums.EOrderStatus.Pending);
            SetProperty(command, type.GetProperty("ExpectedDeliveryDate")!, null);
        }

        if (type.FullName == "Ecommerce.Application.Features.Products.Queries.SearchProducts.SearchProductsQuery")
        {
            SetProperty(command, type.GetProperty("Query")!, null);
            SetProperty(command, type.GetProperty("Keyword")!, "phone");
        }
    }

    private static void SetProperty(object instance, PropertyInfo property, object? value)
    {
        property.SetValue(instance, value);
    }
}
