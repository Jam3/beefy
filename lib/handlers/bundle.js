module.exports = handleEntryPoints

var accumError = require('../accumulate-error.js')
  , ansicolors = require('ansicolors')

// opts = {
//     entries: {
//         <repr>: <path>
//     }
//   , bundler: {
//         flags: []
//       , command: ""
//     }
// }
function handleEntryPoints(opts, io, nextHandler) {
  var entries = opts.entries
    , bundlerOpts

  bundlerOpts = opts.bundler

  if(!opts.entries || !opts.bundler) {
    return nextHandler
  }

  if(bundlerOpts.legacy) {
    return nextHandler
  }

  return handle

  function handle(server, req, resp, parsed) {
    var pathname = parsed.pathname
    while(pathname.substr(0, 2) === '//') pathname = pathname.substr(1, pathname.length-1);
    if(!(pathname in entries) && !('browserify' in parsed.query)) {
      return nextHandler(server, req, resp, parsed)
    }

    var entryPath = entries[pathname]
      , args = bundlerOpts.flags.slice()
      , bundler
      , output

    args.unshift(bundlerOpts.command.bundler, entryPath)
    parsed.loggedPathname = ansicolors.magenta(
        pathname + ' ➞ ' + args.map(toLocal).join(' ')
    )
    args.shift()
    args.shift()

    bundler = bundlerOpts.command(entryPath)
    bundler.stderr.pipe(accumError(io.error, resp))
    resp.setHeader('content-type', 'text/javascript')
    bundler.stdout.pipe(resp)
  }

  function toLocal(file) {
    return (file || '').replace(opts.cwd, '.')
  }

}
