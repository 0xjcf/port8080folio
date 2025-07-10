# Actor-SPA Performance Benchmarks

This directory contains performance benchmarks for the Actor-SPA framework.

## Structure

- `actor-ref/` - ActorRef performance tests
- `mailbox/` - Mailbox throughput tests
- `observable/` - Observable performance tests
- `integration/` - Full system benchmarks

## Running Benchmarks

```bash
# Run all benchmarks
pnpm benchmark

# Run specific benchmark
pnpm benchmark actor-ref

# Run with memory profiling
pnpm benchmark:memory
```

## Benchmark Requirements

Based on IMPLEMENTATION.md, the following performance targets must be met:

- **Message Throughput**: 10,000 events/second per actor
- **Concurrent Actors**: Support 1,000 concurrent actors
- **Memory Usage**: < 100MB for 1,000 actors
- **Latency**: < 1ms message delivery time
- **Ask Pattern**: < 10ms round-trip time

## Writing Benchmarks

Agent C is responsible for implementing benchmark harnesses.
Agent B is responsible for optimizing to meet targets.