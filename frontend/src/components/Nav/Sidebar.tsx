

export default function Sidebar () {

    const nav = [
        {title: 'Home', link: '/'},
        {title: 'About', link: '*'},
        {title: 'Contact', link: '*'},
    ];
    return(
        <div className='min-w-44 border-r-8 bg-gray-500'>
            <nav>
                {nav.map((item) => (
                    <div key={item.title}>
                        <a href={item.link}>
                            {item.title}
                        </a>
                    </div>
                ))}
            </nav>
        </div>
    )
}