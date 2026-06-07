"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

type FooterLink = {
	title: string;
	href: string;
};

type FooterSection = {
	label: string;
	links: FooterLink[];
};

const footerLinks: FooterSection[] = [
	{
		label: "Product",
		links: [
			{ title: "Open app", href: "/app/" },
			{ title: "Capabilities", href: "/#capabilities" },
			{ title: "Get started", href: "/#start" },
			{ title: "Dashboard", href: "/app/" },
		],
	},
	{
		label: "Workspace",
		links: [
			{ title: "Accounts", href: "/app/#/accounts" },
			{ title: "Transactions", href: "/app/#/transactions" },
			{ title: "Budgets", href: "/app/#/budgets" },
			{ title: "Receipts", href: "/app/#/receipts" },
		],
	},
	{
		label: "Company",
		links: [
			{ title: "About Trackly", href: "/#product" },
			{ title: "Privacy", href: "/#start" },
			{ title: "Terms", href: "/#start" },
			{ title: "Support", href: "/app/" },
		],
	},
	{
		label: "Connect",
		links: [
			{ title: "Sign in", href: "/app/" },
			{ title: "Create account", href: "/app/" },
			{ title: "Insights", href: "/app/#/insights" },
			{ title: "Export data", href: "/app/#/export" },
		],
	},
];

export function Footer() {
	return (
		<footer
			className={cn(
				"relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center rounded-t-4xl border-t px-6 md:rounded-t-6xl md:px-8",
				"dark:bg-[radial-gradient(35%_128px_at_50%_0%,--theme(--color-foreground/.1),transparent)]"
			)}
		>
			<div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/20 blur" />

			<div className="grid w-full gap-8 py-6 md:py-8 lg:grid-cols-3 lg:gap-8">
				<AnimatedContainer className="flex flex-col gap-4">
					<Logo className="h-11 w-auto max-w-[220px]" />
					<p className="text-muted-foreground text-sm md:mt-0">
						Personal finance, fully understood — accounts, budgets, and AI
						insights in one calm workspace.
					</p>
				</AnimatedContainer>

				<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-2 lg:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer delay={0.1 + index * 0.1} key={section.label}>
							<div className="mb-10 md:mb-0">
								<h3 className="font-medium text-xs uppercase tracking-wide">
									{section.label}
								</h3>
								<ul className="mt-4 flex flex-col gap-2 text-muted-foreground text-sm">
									{section.links.map((link) => (
										<li key={link.title}>
											<a
												className="inline-flex items-center duration-250 hover:text-foreground"
												href={link.href}
											>
												{link.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						</AnimatedContainer>
					))}
				</div>
			</div>
			<div className="h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
			<div className="flex w-full items-center justify-center py-4">
				<p className="text-muted-foreground text-sm">
					&copy; {new Date().getFullYear()} Trackly. All rights reserved.
				</p>
			</div>
		</footer>
	);
}

function AnimatedContainer({
	className,
	delay = 0.1,
	children,
}: {
	delay?: number;
	className?: string;
	children: ReactNode;
}) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
			transition={{ delay, duration: 0.8 }}
			viewport={{ once: true }}
			whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
		>
			{children}
		</motion.div>
	);
}