from datetime import datetime

class LoggerState:
    buffer = []
    line_limit = 0
    lines = 0
    default_file = "logs.txt"

global_logger_state = LoggerState()

def log_log(state, type, msg, timestamp):
    if timestamp:
        t = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
        state.buffer.append(f'[{t}] [{type}] {msg}')
    else:
        state.buffer.append(f"[{type}] {msg}")
    state.lines += 1
    if state.line_limit > 0 and state.lines % state.line_limit == 0:
        log_append_to_file(state, state.default_file)

def log_info(state, msg, timestamp=False):
    log_log(state, "INFO", msg, timestamp)

def log_warn(state, msg, timestamp=False):
    log_log(state, "WARN", msg, timestamp)
    
def log_error(state, msg, timestamp=False):
    log_log(state, "ERROR", msg, timestamp)
    
def log_write_to_file(state, filename):
    with open(filename, "w") as f:
        f.write("\n".join(state.buffer))
        f.write("\n")
        f.flush()
    state.buffer.clear()

def log_append_to_file(state, filename):
   with open(filename, "a") as f:
        f.write("\n".join(state.buffer))
        f.write("\n")
        f.flush()
   state.buffer.clear()

