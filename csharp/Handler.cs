using System;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Net;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]
namespace AwsDotnetCsharp
{
    public class Handler
    {
       public APIGatewayProxyResponse Hello(APIGatewayProxyRequest request, ILambdaContext context)
       {
           return new APIGatewayProxyResponse {
             StatusCode = (int)HttpStatusCode.OK,
             Body = "Hello"
           };
       }
    }
}
