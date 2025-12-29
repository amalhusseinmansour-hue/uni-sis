<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiRateLimiter
{
    protected RateLimiter $limiter;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    public function handle(Request $request, Closure $next, string $key = 'api', int $maxAttempts = 60, int $decayMinutes = 1): Response
    {
        $identifier = $this->resolveRequestSignature($request, $key);

        if ($this->limiter->tooManyAttempts($identifier, $maxAttempts)) {
            return $this->buildResponse($identifier, $maxAttempts);
        }

        $this->limiter->hit($identifier, $decayMinutes * 60);

        $response = $next($request);

        return $this->addHeaders(
            $response,
            $maxAttempts,
            $this->calculateRemainingAttempts($identifier, $maxAttempts)
        );
    }

    protected function resolveRequestSignature(Request $request, string $key): string
    {
        if ($user = $request->user()) {
            return sha1($key . '|' . $user->id);
        }

        return sha1($key . '|' . $request->ip());
    }

    protected function buildResponse(string $identifier, int $maxAttempts): Response
    {
        $retryAfter = $this->limiter->availableIn($identifier);

        return response()->json([
            'message' => 'Too many requests. Please slow down.',
            'retry_after' => $retryAfter,
        ], 429)->withHeaders([
            'Retry-After' => $retryAfter,
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => 0,
        ]);
    }

    protected function addHeaders(Response $response, int $maxAttempts, int $remainingAttempts): Response
    {
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => $remainingAttempts,
        ]);

        return $response;
    }

    protected function calculateRemainingAttempts(string $identifier, int $maxAttempts): int
    {
        return $maxAttempts - $this->limiter->attempts($identifier) + 1;
    }
}
