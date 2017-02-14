import React from 'react'
import ReactDOM from 'react-dom'

const ComponentA = a => <div>Hello {a.fullName}</div>

ReactDOM.render(<ComponentA fullName="Giulio Canti" />, document.getElementById('app'))

const f = b => ({ fullName: `${b.name} ${b.surname}` })

const ComponentB = b => ComponentA(f(b))

ReactDOM.render(<ComponentB name="Giulio" surname="Canti" />, document.getElementById('app'))
