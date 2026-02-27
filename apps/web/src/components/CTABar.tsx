import { Link } from 'react-router-dom'

type CTABarProps = {
  logo: string
  logoAlt: string
  logoClassName?: string
  title: string
  desc: string
  btn1Label: string
  btn1To: string
  btn2Label?: string
  btn2To?: string
}

export default function CTABar({
  logo,
  logoAlt,
  logoClassName = 'h-6 lg:h-10',
  title,
  desc,
  btn1Label,
  btn1To,
  btn2Label,
  btn2To,
}: CTABarProps) {
  return (
    <>
      {/* Box: logo + title + desc (all screen sizes); buttons inside box on desktop only */}
      <section className="grid-12 items-center bg-zinc-100 rounded-[10px] lg:h-[176px] mx-4 lg:mx-0 my-4 lg:my-0 px-4 lg:px-0">
        <div className="col-span-4 lg:col-span-3 flex items-center justify-center lg:justify-start h-full py-6 lg:py-0 lg:pl-10">
          <img src={logo} alt={logoAlt} className={`${logoClassName} w-auto object-contain`} />
        </div>

        <div className="col-span-4 lg:col-span-6 flex flex-col items-center lg:items-start justify-center gap-1 lg:pl-[50px] pb-6 lg:pb-0">
          <h2 className="text-black text-2xl font-bold font-['Inter'] leading-8 lg:leading-9 m-0 text-center lg:text-left">
            {title}
          </h2>
          <p className="text-black text-base font-normal font-['Inter'] leading-6 text-center lg:text-left max-w-[480px]">
            {desc}
          </p>
        </div>

        {/* Desktop-only buttons inside the box */}
        <div className="col-span-4 lg:col-span-3 hidden lg:flex flex-col items-end justify-center gap-3 lg:pr-10">
          <Link
            to={btn1To}
            className="w-auto min-w-[200px] h-12 px-6 bg-slate-900 rounded-[10px] inline-flex justify-center items-center text-white hover:bg-slate-700 transition-colors font-semibold text-sm whitespace-nowrap"
          >
            {btn1Label}
          </Link>
          {btn2Label && btn2To && (
            <Link
              to={btn2To}
              className="w-auto min-w-[200px] h-12 px-6 rounded-[10px] outline outline-1 outline-slate-900 inline-flex justify-center items-center text-slate-900 hover:bg-slate-900 hover:text-white transition-colors font-semibold text-sm whitespace-nowrap"
            >
              {btn2Label}
            </Link>
          )}
        </div>
      </section>

      {/* Mobile-only buttons outside the box */}
      <div className="flex lg:hidden flex-col gap-3 mx-4 mt-4">
        <Link
          to={btn1To}
          className="w-full h-12 px-6 bg-slate-900 rounded-[10px] inline-flex justify-center items-center text-white hover:bg-slate-700 transition-colors font-semibold text-sm"
        >
          {btn1Label}
        </Link>
        {btn2Label && btn2To && (
          <Link
            to={btn2To}
            className="w-full h-12 px-6 rounded-[10px] outline outline-1 outline-slate-900 inline-flex justify-center items-center text-slate-900 hover:bg-slate-900 hover:text-white transition-colors font-semibold text-sm"
          >
            {btn2Label}
          </Link>
        )}
      </div>
    </>
  )
}
