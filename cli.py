import functools
import json
import logging
import os
import subprocess
import sys
import time
import uuid


short_name = "tolt"
root_folder = f"{os.environ['HOME']}/github.com/loicbourgois/tolt"
logger_name = "tolt-cli"


logging.basicConfig(
    format='GMT %(asctime)s %(filename)20s %(funcName)20s() %(lineno)4s %(levelname)7s | %(message)s',
    level=logging.DEBUG,
)
logging.Formatter.converter = time.gmtime
logger = logging.getLogger(logger_name)


class formattings:
    GREEN = '\033[92m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    GREY = '\033[90m'
    ENDC = '\033[0m'
def grey(message):
    return f"{formattings.GREY}{message}{formattings.ENDC}"
def blue(message):
    return f"{formattings.BLUE}{message}{formattings.ENDC}"
def green(message):
    return f"{formattings.GREEN}{message}{formattings.ENDC}"
def red(message):
    return f"{formattings.RED}{message}{formattings.ENDC}"


def timeit(method):
    @functools.wraps(method)
    def timeit_(*args, **kw):
        spaces = ""
        frame = sys._getframe().f_back
        try:
            while frame.f_code.co_name != "<module>":
                frame = frame.f_back
                spaces += " "
        except:
            pass
        # TODO: export {json.dumps(args)} - {json.dumps(kw)} in a `show_args` annotation
        logger.debug(grey(f'{spaces}{method.__name__}() - begin - {json.dumps(args)} - {json.dumps(kw)}'))
        ts = time.time()
        result = method(*args, **kw)
        te = time.time()
        if 'log_time' in kw:
            name = kw.get('log_name', method.__name__.upper())
            kw['log_time'][name] = int(te - ts)
        else:
            logger.debug(grey(f'{spaces}{method.__name__}() - end - {(te - ts):2.3f}s'))
        return result
    return timeit_


stdouts = {}
def runcmd(command: str, quiet=False, shell=False):
    return runcmd_list(command.split(" "), quiet, shell=shell)
def runcmd_list(command: list, quiet=False, shell=False):
    if not quiet:
        for line in " ".join(command).split("\n"):
            logger.info("> " + line)
    def stream_process(process, command_id):
        go = process.poll() is None
        for line in process.stdout:
            l = os.linesep.join([s for s in line.decode("UTF8").splitlines() if s])
            if not quiet:
                logger.info(grey(l))
            stdouts[command_id].append(l)
        return go
    command_id = str(uuid.uuid4())
    stdouts[command_id] = []
    process = subprocess.Popen(command, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    while stream_process(process, command_id):
        time.sleep(0.1)
    assert process.returncode == 0, f"invalid returncode: expected 0, got {process.returncode} - command: {command}"
    return stdouts[command_id]


def help():
    logger.info("commands:")
    for key, value in commands.items():
        if key is not None:
            logger.info(f"    sml {key}")


def invalid_command():
    logger.error(red("invalid command")+f": {' '.join(sys.argv)}")
    help()
    sys.exit(1)


def push():
    runcmd(f"git -C {root_folder} add .")
    runcmd(f"git -C {root_folder} commit -m up")
    runcmd(f"git -C {root_folder} push")


def status():
    runcmd(f"git -C {root_folder} fetch --all")
    runcmd(f"git -C {root_folder} status")


def sync():
    logger.warning(f"not implemented")


def readme():
    runcmd(f"open {root_folder}/README.md")


def help():
    logger.info("commands:")
    for key, command in commands.items():
        if key is not None:
            logger.info(f"    {short_name} {command['doc']}")
            if command.get("example"):
                logger.info(f"      example: {command['example']}")


def about():
    logger.info("The Open Legal Toolkit")
    logger.info("Say hi at https://github.com/loicbourgois/tolt.")


def dev():
    build()
    runcmd(f"npm --prefix {root_folder}/tolt-web/www run start")


def build():
    runcmd(f"wasm-pack build {root_folder}/tolt-web")
    runcmd(f"npm install {root_folder}/tolt-web/www")
    #runcmd(f"npm --prefix {root_folder}/tolt-web/www run start")


def release():
    runcmd(f"rm -rf {root_folder}/docs")
    runcmd(f"npm audit fix {root_folder}/tolt-web/www")
    build()
    runcmd(f"npm --prefix {root_folder}/tolt-web/www run build")
    runcmd(f"cp -r {root_folder}/tolt-web/www/dist {root_folder}/docs")


def cd():
    logger.info(f"cd {root_folder}")

commands = {
    'about': {
        'func': about,
        'doc': 'about',
    },
    'help': {
        'func': help,
        'doc': 'help',
    },
    'readme': {
        'func': readme,
        'doc': 'readme',
    },
    'status': {
        'func': status,
        'doc': 'status',
    },
    'push': {
        'func': push,
        'doc': 'push',
    },
    'sync': {
        'func': sync,
        'doc': 'sync',
    },
    'dev': {
        'func': dev,
        'doc':  'dev'
    },
    'cd': {
        'func': cd,
        'doc':  'cd'
    },
    'build': {
        'func': build,
        'doc':  'build'
    },
    'release': {
        'func': release,
        'doc': release
    },
    None: {
        'func': invalid_command,
    }
}


@timeit
def main():
    if len(sys.argv) >= 2:
        command = sys.argv[1]
        args = sys.argv[2:]
        commands[command]['func'](*args)
    else:
        invalid_command()


if __name__ == '__main__':
    main()
