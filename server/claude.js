import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Runs the local `claude` CLI headless, so it uses your existing Claude login.
// Tools, MCP servers and settings are disabled; it behaves as a plain model call.
const CWD = path.join(tmpdir(), 'pm-prep-claude');
mkdirSync(CWD, { recursive: true });

export function askClaude({ system, prompt, model = 'sonnet', timeoutMs = 180_000 }) {
  return new Promise((resolve, reject) => {
    const args = [
      '-p',
      '--output-format', 'json',
      '--model', model,
      '--tools', '',
      '--system-prompt', system,
      '--no-session-persistence',
      '--strict-mcp-config',
      '--setting-sources', '',
    ];
    const child = spawn('claude', args, { cwd: CWD, env: process.env });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Claude timed out'));
    }, timeoutMs);

    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      try {
        const parsed = JSON.parse(out);
        if (parsed.is_error) return reject(new Error(parsed.result || 'Claude returned an error'));
        resolve(parsed.result.trim());
      } catch {
        reject(new Error(`claude exited ${code}: ${err || out}`.slice(0, 2000)));
      }
    });
    child.stdin.end(prompt);
  });
}

// Pulls the first JSON object/array out of a model reply (tolerates ```json fences).
export function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.search(/[[{]/);
  const end = Math.max(body.lastIndexOf('}'), body.lastIndexOf(']'));
  return JSON.parse(body.slice(start, end + 1));
}
