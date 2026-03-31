<?php

namespace App\Traits;

trait ApiResponse
{
    protected function successResponse($data, $message = null, $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function errorResponse($message = null, $code = 400, $data = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function success($data, $message = null, $code = 200)
    {
        return $this->successResponse($data, $message, $code);
    }

    protected function error($message = null, $code = 400, $data = null)
    {
        return $this->errorResponse($message, $code, $data);
    }
}
