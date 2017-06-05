package com.serverless;

public class Response {

	private final String body;
	private final Integer status;

	public Response(String body, Integer status) {
		this.body = body;
		this.status = status;
	}

	public String getBody() {
		return this.body;
	}

	public Integer getInput() {
		return this.status;
	}
}
