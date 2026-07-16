
export default function Topbar() {

    return  (
        <div className='flex items-center justify-start gap-10 h-12 w-full bg-gray-200'>
            <div className='bg-gray-700 w-44 h-full flex justify-between items-center px-4'>
                <h1>User</h1>
                <p>\/</p>
            </div>
            <div>search</div>
            <div>settings</div>
        </div>
    )
}