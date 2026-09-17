// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";

// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export default function BusinessAuthForm({ mode }) {
//   const isLogin = mode === "login";
//   const isRegister = mode === "register";
//   const isReset = mode === "reset";
//   const router = useRouter();

//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [resetSubmitted, setResetSubmitted] = useState(false);

//   async function handleSubmit(event) {
//     event.preventDefault();

//     if (isLogin) {
//       setError("");
//       setLoading(true);

//       const formData = new FormData(event.target);
//       const email = formData.get("email");
//       const password = formData.get("password");

//       const res = await signIn("business-credentials", {
//         email,
//         password,
//         redirect: false,
//       });

//       if (res?.error) {
//         setLoading(false);
//         setError("Invalid email or password.");
//         return;
//       }

//       const planRes = await fetch("/api/business/plan-status");
//       const planData = await planRes.json();

//       setLoading(false);

//       if (!planData.hasPlan) {
//         router.push("/business/select-plan");
//       } else if (planData.planType === "advertiser") {
//         router.push("/business/advertiserdashboard");
//       } else if (planData.planType === "directory_listing") {
//         router.push("/business/listingdashboard");
//       } else {
//         router.push("/business/dashboard");
//       }

//       router.refresh();
//       return;
//     }

//     if (isRegister) {
//       setError("");
//       setLoading(true);
    
//       const formData = new FormData(event.target);
//       const businessName = formData.get("businessName");
//       const email = formData.get("email");
//       const password = formData.get("password");
//       const category = formData.get("category");
    
//       const res = await fetch("/api/business/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ businessName, email, password, category }),
//       });
    
//       const data = await res.json();
//       setLoading(false);
    
//       if (!res.ok) {
//         setError(data.error || "Something went wrong.");
//         return;
//       }
    
//       router.push("/business/login");
//       router.refresh();
//       return;
//     }

   
//     setError("");
//     setResetSubmitted(true);
//   }

//   if (resetSubmitted) {
//     return (
//       <div className="w-full text-center">
//         <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf6e5] text-3xl font-bold text-[#2f7d1b]">
//           ✓
//         </div>

//         <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//           Check your inbox
//         </p>

//         <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#0b1830]">
//           Reset link requested.
//         </h2>

//         <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-500">
//           When the backend is connected, a secure reset link will be sent to your email address.
//         </p>

//         <Link
//           href="/business/login"
//           className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2f7d1b] px-5 text-sm font-bold text-white transition hover:bg-[#246515]"
//         >
//           Back to login
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <div>
//         <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//           {isLogin
//             ? "Welcome back"
//             : isRegister
//               ? "Join Mara Media"
//               : "Account recovery"}
//         </p>

//         <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#0b1830] sm:text-4xl">
//           {isLogin
//             ? "Sign in to your business account."
//             : isRegister
//               ? "Register your business."
//               : "Reset your password."}
//         </h2>

//         <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
//           {isLogin
//             ? "Manage your profile and offers from one place."
//             : isRegister
//               ? "Create a profile and help readers discover what makes your business special."
//               : "Enter your email and we will help you get back in."}
//         </p>
//       </div>

//       {error && (
//         <div className="mt-6 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
//           {error}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="mt-7 space-y-5">
//         {isRegister && (
//           <label className="block text-xs font-bold text-[#0b1830]">
//             Business name
//             <input
//               required
//               name="businessName"
//               type="text"
//               placeholder="The Harbour House"
//               className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
//             />
//           </label>
//         )}

//         <label className="block text-xs font-bold text-[#0b1830]">
//           Email address
//           <input
//             required
//             name="email"
//             type="email"
//             placeholder="you@yourbusiness.com"
//             className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
//           />
//         </label>

//         {!isReset && (
//           <label className="block text-xs font-bold text-[#0b1830]">
//             Password
//             <span className="relative mt-2 block">
//               <input
//                 required
//                 name="password"
//                 minLength={8}
//                 type={showPassword ? "text" : "password"}
//                 placeholder="At least 8 characters"
//                 className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-16 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-0 h-11 text-[10px] font-bold text-[#2f7d1b]"
//               >
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </span>
//           </label>
//         )}

//         {isRegister && (
//           <label className="block text-xs font-bold text-[#0b1830]">
//             Business category
//             <select
//               required
//               name="category"
//               defaultValue=""
//               className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-600 outline-none transition focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
//             >
//               <option value="" disabled>
//                 Select a category
//               </option>
//               <option>Hospitality</option>
//               <option>Food & drink</option>
//               <option>Things to do</option>
//               <option>Retail</option>
//               <option>Professional services</option>
//             </select>
//           </label>
//         )}

//         {isLogin && (
//           <div className="flex items-center justify-between gap-3 text-xs">
//             <label className="flex items-center gap-2 font-normal text-slate-500">
//               <input type="checkbox" className="h-4 w-4 accent-[#2f7d1b]" />
//               Remember me
//             </label>

//             <Link
//               href="/business/reset-password"
//               className="font-bold text-[#2f7d1b] hover:text-[#246515]"
//             >
//               Forgot password?
//             </Link>
//           </div>
//         )}

//         {isRegister && (
//           <label className="flex items-center gap-2 text-xs font-normal text-slate-500">
//             <input required type="checkbox" className="h-4 w-4 accent-[#2f7d1b]" />
//             I agree to the business partner terms.
//           </label>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515] disabled:opacity-60"
//         >
//           {loading
//             ? isRegister
//               ? "Creating account..."
//               : "Signing in..."
//             : isLogin
//               ? "Sign in"
//               : isRegister
//                 ? "Create business account"
//                 : "Send reset link"}
//         </button>
//       </form>

//       <div className="mt-7 text-center text-xs text-slate-500">
//         {isLogin && (
//           <>
//             New to Mara Media?{" "}
//             <Link href="/business/register" className="font-bold text-[#2f7d1b]">
//               Register your business
//             </Link>
//           </>
//         )}

//         {isRegister && (
//           <>
//             Already have an account?{" "}
//             <Link href="/business/login" className="font-bold text-[#2f7d1b]">
//               Sign in
//             </Link>
//           </>
//         )}

//         {isReset && (
//           <>
//             Remember your password?{" "}
//             <Link href="/business/login" className="font-bold text-[#2f7d1b]">
//               Back to login
//             </Link>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import { useState,useEffect } from "react";
import { signIn } from "next-auth/react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BusinessAuthForm({ mode }) {
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  

  useEffect(() => {
    if (!isRegister) return;
    setCategoriesLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, [isRegister]);


  async function handleSubmit(event) {
    event.preventDefault();

    if (isLogin) {
      setError("");
      setLoading(true);

      const formData = new FormData(event.target);
      const email = formData.get("email");
      const password = formData.get("password");

      const res = await signIn("business-credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError("Invalid email or password.");
        return;
      }

      const planRes = await fetch("/api/business/plan-status");
      const planData = await planRes.json();

      setLoading(false);

      if (!planData.hasPlan) {
        router.push("/business/select-plan");
      } else if (planData.planType === "advertiser") {
        router.push("/business/advertiserdashboard");
      } else if (planData.planType === "directory_listing") {
        router.push("/business/listingdashboard");
      } else {
        router.push("/business/dashboard");
      }

      router.refresh();
      return;
    }

    if (isRegister) {
      setError("");
      setLoading(true);
    
      const formData = new FormData(event.target);
      const businessName = formData.get("businessName");
      const email = formData.get("email");
      const password = formData.get("password");
      const categoryId = formData.get("categoryId");
    
      const res = await fetch("/api/business/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, email, password, categoryId }),
      });
    
      const data = await res.json();
      setLoading(false);
    
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
    
      router.push("/business/login");
      router.refresh();
      return;
    }

    // Reset password
    setError("");
    setLoading(true);

    const formData = new FormData(event.target);
    const email = formData.get("email");

    try {
      const res = await fetch("/api/business/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Regardless of whether the email exists, the API returns success
      // so we don't leak which addresses are registered. Only a network
      // or server-side failure should surface an error to the user.
      if (!res.ok) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
        return;
      }

      setLoading(false);
      setResetSubmitted(true);
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  if (resetSubmitted) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf6e5] text-3xl font-bold text-[#2f7d1b]">
          ✓
        </div>

        <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
          Check your inbox
        </p>

        <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#0b1830]">
          Reset link requested.
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-500">
          If an account exists for that email, a secure reset link has been sent.
        </p>

        <Link
          href="/business/login"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2f7d1b] px-5 text-sm font-bold text-white transition hover:bg-[#246515]"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
          {isLogin
            ? "Welcome back"
            : isRegister
              ? "Join Mara Media"
              : "Account recovery"}
        </p>

        <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#0b1830] sm:text-4xl">
          {isLogin
            ? "Sign in to your business account."
            : isRegister
              ? "Register your business."
              : "Reset your password."}
        </h2>

        <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
          {isLogin
            ? "Manage your profile and offers from one place."
            : isRegister
              ? "Create a profile and help readers discover what makes your business special."
              : "Enter your email and we will help you get back in."}
        </p>
      </div>

      {error && (
        <div className="mt-6 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {isRegister && (
          <label className="block text-xs font-bold text-[#0b1830]">
            Business name
            <input
              required
              name="businessName"
              type="text"
              placeholder="The Harbour House"
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
            />
          </label>
        )}

        <label className="block text-xs font-bold text-[#0b1830]">
          Email address
          <input
            required
            name="email"
            type="email"
            placeholder="you@yourbusiness.com"
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
          />
        </label>

        {!isReset && (
          <label className="block text-xs font-bold text-[#0b1830]">
            Password
            <span className="relative mt-2 block">
              <input
                required
                name="password"
                minLength={8}
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-16 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-0 h-11 text-[10px] font-bold text-[#2f7d1b]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>
        )}

{isRegister && (
  <label className="block text-xs font-bold text-[#0b1830]">
    Business category
    <select
      required
      name="categoryId"
      defaultValue=""
      disabled={categoriesLoading}
      className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-600 outline-none transition focus:border-[#2f7d1b] focus:ring-4 focus:ring-[#2f7d1b]/10"
    >
      <option value="" disabled>
        {categoriesLoading ? "Loading categories..." : "Select a category"}
      </option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  </label>
)}

        {isLogin && (
          <div className="flex items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 font-normal text-slate-500">
              <input type="checkbox" className="h-4 w-4 accent-[#2f7d1b]" />
              Remember me
            </label>

            <Link
              href="/business/reset-password"
              className="font-bold text-[#2f7d1b] hover:text-[#246515]"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {isRegister && (
          <label className="flex items-center gap-2 text-xs font-normal text-slate-500">
            <input required type="checkbox" className="h-4 w-4 accent-[#2f7d1b]" />
            I agree to the business partner terms.
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515] disabled:opacity-60"
        >
          {loading
            ? isRegister
              ? "Creating account..."
              : isLogin
                ? "Signing in..."
                : "Sending reset link..."
            : isLogin
              ? "Sign in"
              : isRegister
                ? "Create business account"
                : "Send reset link"}
        </button>
      </form>

      <div className="mt-7 text-center text-xs text-slate-500">
        {isLogin && (
          <>
            New to Mara Media?{" "}
            <Link href="/business/register" className="font-bold text-[#2f7d1b]">
              Register your business
            </Link>
          </>
        )}

        {isRegister && (
          <>
            Already have an account?{" "}
            <Link href="/business/login" className="font-bold text-[#2f7d1b]">
              Sign in
            </Link>
          </>
        )}

        {isReset && (
          <>
            Remember your password?{" "}
            <Link href="/business/login" className="font-bold text-[#2f7d1b]">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}