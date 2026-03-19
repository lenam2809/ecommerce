using Ecommerce.Domain.Interfaces.Logging;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace Ecommerce.Application.Common.Attributes
{
    [AttributeUsage(AttributeTargets.Method, Inherited = false, AllowMultiple = false)]
    public class PerformanceTrackingAttribute : Attribute
    {
        public static async Task<T> TrackAsync<T>(
            Func<Task<T>> action,
            IEnhancedLogger logger,
            [CallerMemberName] string methodName = "",
            [CallerFilePath] string filePath = "")
        {
            var className = Path.GetFileNameWithoutExtension(filePath);
            var stopwatch = Stopwatch.StartNew();

            try
            {
                return await action();
            }
            finally
            {
                stopwatch.Stop();
                await logger.LogPerformanceAsync(
                    methodName,
                    className,
                    stopwatch.ElapsedMilliseconds);
            }
        }

        // Overload cho các phương thức không async
        public static T Track<T>(
            Func<T> action,
            IEnhancedLogger logger,
            [CallerMemberName] string methodName = "",
            [CallerFilePath] string filePath = "")
        {
            var className = Path.GetFileNameWithoutExtension(filePath);
            var stopwatch = Stopwatch.StartNew();

            try
            {
                return action();
            }
            finally
            {
                stopwatch.Stop();
                logger.LogPerformanceAsync(
                    methodName,
                    className,
                    stopwatch.ElapsedMilliseconds)
                    .ConfigureAwait(false);
            }
        }
    }
}

