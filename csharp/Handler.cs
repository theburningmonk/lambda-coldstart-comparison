using System;

namespace AwsDotnetCsharp
{
    public class Handler
    {
       public Response Hello(Request request)
       {
           return new Response {
             statusCode = 200,
             body = "hello"
           };
       }
    }

    public class Response
    {
      public int statusCode { get; set;}
      public string body {get; set;}
    }

    public class Request
    {
    }
}
